import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import createApp from "../app.js";
import User from "../models/User.js";
import Day from "../models/Day.js";
import MealPlan from "../models/MealPlan.js";
import TrainingPlan from "../models/TrainingPlan.js";
import WeeklyPlan from "../models/WeeklyPlan.js";
import { startTestServer } from "./helpers/httpTestServer.js";
import { createJsonRequest, mockMethod } from "./helpers/mockUtils.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockAuthUser = () => ({
  _id: "user-1",
  email: "test@example.com",
});

const setupAuthenticatedUser = () =>
  mockMethod(User, "findById", () => ({
    select: async () => mockAuthUser(),
  }));

export const runDataTests = async () => {
  await testCreateDay();
  await testCreateDayRejectsDuplicateDate();
  await testGetDays();
  await testGetDayByDate();
  await testGetDaysRejectsMissingToken();
  await testUpdateDay();
  await testGetMealPlanSeedsDefault();
  await testUpsertMealPlan();
  await testGetTrainingPlanSeedsDefault();
  await testUpsertTrainingPlan();
  await testUpsertWeeklyPlan();
};

const testCreateDay = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(Day, "findOne", async () => null);
  const restoreCreate = mockMethod(Day, "create", async (payload) => ({
    _id: "day-1",
    ...payload,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: "2026-04-12",
        tipo: "entrenamiento",
        mealChecks: { desayuno: true },
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 201);
    assert.equal(data.day.date, "2026-04-12");
    assert.equal(data.day.user, "user-1");
  } finally {
    restoreFindById();
    restoreFindOne();
    restoreCreate();
    await server.close();
  }
};

const testGetDays = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFind = mockMethod(Day, "find", () => ({
    sort: async () => [
      { _id: "day-1", date: "2026-04-12", user: "user-1" },
      { _id: "day-2", date: "2026-04-11", user: "user-1" },
    ],
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.days.length, 2);
    assert.equal(data.days[0].date, "2026-04-12");
  } finally {
    restoreFindById();
    restoreFind();
    await server.close();
  }
};

const testCreateDayRejectsDuplicateDate = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const existingDay = { _id: "day-existing", date: "2026-04-12", user: "user-1" };
  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(Day, "findOne", async () => existingDay);

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: "2026-04-12",
        tipo: "entrenamiento",
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 409);
    assert.equal(data.message, "Ya existe un dia para esa fecha");
    assert.equal(data.day._id, "day-existing");
  } finally {
    restoreFindById();
    restoreFindOne();
    await server.close();
  }
};

const testGetDayByDate = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(Day, "findOne", async (filter) => {
    if (filter.date === "2026-04-12") {
      return { _id: "day-1", date: "2026-04-12", user: "user-1" };
    }

    return null;
  });

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days?date=2026-04-12", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.day._id, "day-1");
    assert.equal(data.day.date, "2026-04-12");
  } finally {
    restoreFindById();
    restoreFindOne();
    await server.close();
  }
};

const testGetDaysRejectsMissingToken = async () => {
  const app = createApp();
  const server = await startTestServer(app);

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days", {
      method: "GET",
    });
    const data = await response.json();

    assert.equal(response.status, 401);
    assert.equal(data.message, "No token provided");
  } finally {
    await server.close();
  }
};

const testUpdateDay = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const dayDocument = {
    _id: "day-1",
    user: "user-1",
    date: "2026-04-12",
    tipo: "descanso",
    selecciones: {},
    mealChecks: {},
    workout: [],
    cardio: false,
    entrenoCheck: false,
    meals: {},
    progress: 0,
    isPerfectDay: false,
    toObject() {
      return {
        _id: this._id,
        user: this.user,
        date: this.date,
        tipo: this.tipo,
        selecciones: this.selecciones,
        mealChecks: this.mealChecks,
        workout: this.workout,
        cardio: this.cardio,
        entrenoCheck: this.entrenoCheck,
        meals: this.meals,
        progress: this.progress,
        isPerfectDay: this.isPerfectDay,
      };
    },
    async save() {
      return this;
    },
  };

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(Day, "findOne", async (filter) => {
    if (filter._id === "day-1") {
      return dayDocument;
    }

    return null;
  });

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/days/day-1", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "entrenamiento",
        cardio: true,
        mealChecks: { desayuno: true },
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.day.tipo, "entrenamiento");
    assert.equal(data.day.cardio, true);
    assert.equal(data.day.mealChecks.desayuno, true);
  } finally {
    restoreFindById();
    restoreFindOne();
    await server.close();
  }
};

const testUpsertWeeklyPlan = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOneAndUpdate = mockMethod(
    WeeklyPlan,
    "findOneAndUpdate",
    async (_filter, update) => ({
      _id: "plan-1",
      user: update.user,
      days: update.days,
    })
  );

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/weekly-plan", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        days: {
          lunes: { entreno: "superior", cardio: true },
        },
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.weeklyPlan.user, "user-1");
    assert.equal(data.weeklyPlan.days.lunes.entreno, "superior");
  } finally {
    restoreFindById();
    restoreFindOneAndUpdate();
    await server.close();
  }
};

const testGetMealPlanSeedsDefault = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(MealPlan, "findOne", async () => null);
  const restoreCreate = mockMethod(MealPlan, "create", async (payload) => ({
    _id: "meal-plan-1",
    ...payload,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/meal-plan", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.mealPlan.user, "user-1");
    assert.equal(data.mealPlan.estructuraDias.semana.length, 5);
    assert.equal(data.mealPlan.estructuraDias.finde.length, 4);
    assert.equal(data.mealPlan.bloques.bloque3.fruta[0], "300g pina en su jugo");
  } finally {
    restoreFindById();
    restoreFindOne();
    restoreCreate();
    await server.close();
  }
};

const testUpsertMealPlan = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOneAndUpdate = mockMethod(
    MealPlan,
    "findOneAndUpdate",
    async (_filter, update) => ({
      _id: "meal-plan-1",
      user: update.user,
      estructuraDias: update.estructuraDias,
      bloques: update.bloques,
    })
  );

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/meal-plan", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estructuraDias: {
          semana: [{ id: "uno", hora: "08:00", bloques: ["bloque1"] }],
          finde: [{ id: "dos", hora: "12:00", bloques: ["bloque4"] }],
        },
        bloques: {
          bloque1: {
            proteina: ["opcion personalizada"],
          },
        },
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.mealPlan.user, "user-1");
    assert.equal(data.mealPlan.estructuraDias.semana[0].hora, "08:00");
    assert.equal(data.mealPlan.bloques.bloque1.proteina[0], "opcion personalizada");
  } finally {
    restoreFindById();
    restoreFindOneAndUpdate();
    await server.close();
  }
};

const testGetTrainingPlanSeedsDefault = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOne = mockMethod(TrainingPlan, "findOne", async () => null);
  const restoreCreate = mockMethod(TrainingPlan, "create", async (payload) => ({
    _id: "training-plan-1",
    ...payload,
  }));

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/training-plan", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.trainingPlan.user, "user-1");
    assert.equal(data.trainingPlan.routines.inferior.length, 7);
    assert.equal(data.trainingPlan.routines.superior.length, 6);
    assert.equal(data.trainingPlan.routines.inferior[0].nombre, "Sentadilla goblet");
  } finally {
    restoreFindById();
    restoreFindOne();
    restoreCreate();
    await server.close();
  }
};

const testUpsertTrainingPlan = async () => {
  const app = createApp();
  const server = await startTestServer(app);
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

  const restoreFindById = setupAuthenticatedUser();
  const restoreFindOneAndUpdate = mockMethod(
    TrainingPlan,
    "findOneAndUpdate",
    async (_filter, update) => ({
      _id: "training-plan-1",
      user: update.user,
      routines: update.routines,
    })
  );

  try {
    const response = await createJsonRequest(server.baseUrl, "/api/training-plan", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        routines: {
          superior: [
            {
              nombre: "Press militar",
              imagen: "/img/custom.png",
              series: 3,
              reps: "12",
              cadencia: "2",
              descanso: "45",
            },
          ],
        },
      }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.trainingPlan.user, "user-1");
    assert.equal(data.trainingPlan.routines.superior[0].nombre, "Press militar");
    assert.equal(data.trainingPlan.routines.superior[0].descanso, "45");
  } finally {
    restoreFindById();
    restoreFindOneAndUpdate();
    await server.close();
  }
};
