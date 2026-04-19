const defaultTrainingPlan = {
  routines: {
    inferior: [
      {
        nombre: "Sentadilla goblet",
        imagen: "/img/sentadilla.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Peso muerto rumano",
        imagen: "/img/pesoMuerto.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Hip thrust",
        imagen: "/img/3.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Zancada bulgara",
        imagen: "/img/exercise-placeholder.svg",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Crunch invertido",
        imagen: "/img/abdominales.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Plancha",
        imagen: "/img/plancha.png",
        series: 4,
        reps: "1",
        cadencia: "30",
        descanso: "30",
      },
      {
        nombre: "Crunch abdominal",
        imagen: "/img/abdominalesLaterales.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
    ],
    superior: [
      {
        nombre: "Remo sentado con banda",
        imagen: "/img/superior1.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Flexiones",
        imagen: "/img/superior2.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Elevaciones laterales con banda",
        imagen: "/img/superior3.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Elevaciones frontales con banda",
        imagen: "/img/superior4.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Curl de biceps con banda",
        imagen: "/img/superior5.png",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
      {
        nombre: "Fondos de triceps en banco",
        imagen: "/img/exercise-placeholder.svg",
        series: 4,
        reps: "15",
        cadencia: "3",
        descanso: "30",
      },
    ],
  },
};

export const cloneDefaultTrainingPlan = () =>
  JSON.parse(JSON.stringify(defaultTrainingPlan));

export default defaultTrainingPlan;
