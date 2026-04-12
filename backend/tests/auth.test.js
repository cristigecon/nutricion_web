import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createApp from "../app.js";
import User from "../models/User.js";
import { startTestServer } from "./helpers/httpTestServer.js";
import { createJsonRequest, mockMethod } from "./helpers/mockUtils.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

export const runAuthTests = async () => {
  await testRegister();
  await testRegisterRejectsDuplicateUser();
  await testLogin();
  await testLoginRejectsInvalidPassword();
  await testMe();
  await testMeRejectsMissingToken();
};

const testRegister = async () => {
  const app = createApp();
  const server = await startTestServer(app);

  const restoreFindOne = mockMethod(User, "findOne", async () => null);
  const restoreCreate = mockMethod(User, "create", async ({ email, passwordHash }) => ({
    _id: "user-1",
    email,
    passwordHash,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "Test1234!" }),
    });
    const data = await response.json();

    assert.equal(response.status, 201);
    assert.equal(data.user.email, "test@example.com");
    assert.ok(data.token);
  } finally {
    restoreFindOne();
    restoreCreate();
    await server.close();
  }
};

const testLogin = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const passwordHash = await bcrypt.hash("Test1234!", 10);

  const restoreFindOne = mockMethod(User, "findOne", async () => ({
    _id: "user-1",
    email: "test@example.com",
    passwordHash,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "Test1234!" }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.user.email, "test@example.com");
    assert.ok(data.token);
  } finally {
    restoreFindOne();
    await server.close();
  }
};

const testRegisterRejectsDuplicateUser = async () => {
  const app = createApp();
  const server = await startTestServer(app);

  const restoreFindOne = mockMethod(User, "findOne", async () => ({
    _id: "existing-user",
    email: "test@example.com",
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "Test1234!" }),
    });
    const data = await response.json();

    assert.equal(response.status, 400);
    assert.equal(data.message, "Usuario ya registrado");
  } finally {
    restoreFindOne();
    await server.close();
  }
};

const testLoginRejectsInvalidPassword = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const passwordHash = await bcrypt.hash("Test1234!", 10);

  const restoreFindOne = mockMethod(User, "findOne", async () => ({
    _id: "user-1",
    email: "test@example.com",
    passwordHash,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "WrongPassword" }),
    });
    const data = await response.json();

    assert.equal(response.status, 400);
    assert.equal(data.message, "Credenciales invalidas");
  } finally {
    restoreFindOne();
    await server.close();
  }
};

const testMe = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = mockMethod(User, "findById", () => ({
    select: async () => ({
      _id: "user-1",
      email: "test@example.com",
      createdAt: "2026-04-12T00:00:00.000Z",
    }),
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.user.email, "test@example.com");
  } finally {
    restoreFindById();
    await server.close();
  }
};

const testMeRejectsMissingToken = async () => {
  const app = createApp();
  const server = await startTestServer(app);

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/auth/me", {
      method: "GET",
    });
    const data = await response.json();

    assert.equal(response.status, 401);
    assert.equal(data.message, "No token provided");
  } finally {
    await server.close();
  }
};
