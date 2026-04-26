import {
  createDayRequest,
  getDaysRequest,
  getWeeklyPlanRequest,
  updateDayRequest,
  updateWeeklyPlanRequest,
} from "./api";
import {
  buildLocalDayPayload,
  getAgenda,
  getAllDayDates,
  getLocalAgendaUpdatedAt,
  getLocalDayUpdatedAt,
  hydrateLocalDay,
  saveAgenda,
} from "./storage";

const hasAnyOwnKey = (value) =>
  Boolean(value && typeof value === "object" && Object.keys(value).length > 0);

let syncTimeoutId = null;

const toTimestamp = (value) => {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? 0 : time;
};

export const syncLocalFirstData = async () => {
  const [daysResponse, weeklyPlanResponse] = await Promise.all([
    getDaysRequest(),
    getWeeklyPlanRequest(),
  ]);

  const remoteDays = daysResponse.days || [];
  const remoteDaysByDate = new Map(remoteDays.map((day) => [day.date, day]));

  const localDates = getAllDayDates();
  const localAgenda = getAgenda();

  if (localDates.length > 0) {
    for (const date of localDates) {
      const localPayload = buildLocalDayPayload(date);
      const remoteDay = remoteDaysByDate.get(date);
      const localUpdatedAt = toTimestamp(getLocalDayUpdatedAt(date));
      const remoteUpdatedAt = toTimestamp(remoteDay?.updatedAt);

      if (!remoteDay?._id) {
        await createDayRequest(localPayload);
      } else if (localUpdatedAt >= remoteUpdatedAt) {
        await updateDayRequest(remoteDay._id, localPayload);
      } else {
        hydrateLocalDay(remoteDay, { notify: false });
      }
    }
  }

  remoteDays.forEach((remoteDay) => {
    if (!localDates.includes(remoteDay.date)) {
      hydrateLocalDay(remoteDay, { notify: false });
    }
  });

  const localAgendaUpdatedAt = toTimestamp(getLocalAgendaUpdatedAt());
  const remoteAgendaUpdatedAt = toTimestamp(weeklyPlanResponse.weeklyPlan?.updatedAt);

  if (hasAnyOwnKey(localAgenda) && localAgendaUpdatedAt >= remoteAgendaUpdatedAt) {
    await updateWeeklyPlanRequest({ days: localAgenda });
  } else if (hasAnyOwnKey(weeklyPlanResponse.weeklyPlan?.days)) {
    saveAgenda(weeklyPlanResponse.weeklyPlan.days, {
      updatedAt: weeklyPlanResponse.weeklyPlan.updatedAt,
      notify: false,
    });
  }
};

export const scheduleSync = (delayMs = 1200, syncTask = syncLocalFirstData) => {
  if (typeof window === "undefined") return;

  if (syncTimeoutId) {
    window.clearTimeout(syncTimeoutId);
  }

  syncTimeoutId = window.setTimeout(() => {
    syncTimeoutId = null;
    Promise.resolve(syncTask()).catch((error) => {
      console.error("syncLocalFirstData failed", error);
    });
  }, delayMs);
};
