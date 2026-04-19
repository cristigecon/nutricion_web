const defaultMealPlan = {
  estructuraDias: {
    semana: [
      { id: "comida_1", hora: "06:30", bloques: ["bloque1"] },
      { id: "comida_2", hora: "10:00", bloques: ["bloque2", "bloque3"] },
      { id: "comida_3", hora: "14:00", bloques: ["bloque4"] },
      { id: "comida_4", hora: "17:00", bloques: ["bloque2", "bloque3"] },
      { id: "comida_5", hora: "20:30", bloques: ["bloque5"] },
    ],
    finde: [
      { id: "comida_1", hora: "10:00", bloques: ["bloque1"] },
      { id: "comida_2", hora: "14:00", bloques: ["bloque4"] },
      { id: "comida_3", hora: "17:00", bloques: ["bloque1"] },
      { id: "comida_4", hora: "22:00", bloques: ["bloque4"] },
    ],
  },
  bloques: {
    bloque1: {
      proteina: [
        "250g queso fresco batido",
        "125g queso fresco batido + 55g pavo cocido",
        "1 yogur proteico + 55g pavo cocido",
        "110g queso cottage + 25g pavo cocido",
        "35g havarti light + 55g pavo cocido",
        "2 quesos frescos desnatados 0% + 25g pavo cocido",
        "1 huevo + 2 claras de huevo + 25g pavo cocido",
        "50g lomo embuchado",
        "65g jamon serrano",
        "110g pavo cocido",
      ],
      carbo: [
        "50g pan de cereales",
        "40g avena (copo, harina o crunchy)",
      ],
      grasa: [
        "5g aceite de oliva",
        "35g aguacate",
        "8g frutos secos",
        "1 onza de chocolate 85-95%",
      ],
    },
    bloque2: {
      proteina: [
        "125g queso fresco batido",
        "1 yogur proteico",
        "40g queso cottage + 25g pavo cocido",
        "20g havarti light + 25g pavo cocido",
        "1 queso fresco desnatado 0% + 15g pavo cocido",
        "1 huevo + 1 clara de huevo",
        "25g lomo embuchado",
        "35g jamon serrano",
        "55g pavo cocido",
      ],
      carbo: [
        "50g pan de cereales",
        "40g avena (copo, harina o crunchy)",
      ],
    },
    bloque3: {
      proteina: [
        "125g queso fresco batido",
        "1 yogur proteico",
        "40g queso cottage + 25g pavo cocido",
        "20g havarti light + 25g pavo cocido",
        "1 queso fresco desnatado 0% + 15g pavo cocido",
        "1 huevo + 1 clara de huevo",
        "25g lomo embuchado",
        "35g jamon serrano",
        "55g pavo cocido",
      ],
      fruta: [
        "300g pina en su jugo",
        "150g manzana",
        "120g banana",
        "240g naranja",
        "360g frutos rojos",
        "380g melon",
        "150g uva",
      ],
    },
    bloque4: {
      proteina: [
        "240g pescado blanco o azul",
        "195g magro de ternera",
        "195g pollo deshuesado",
        "185g pavo deshuesado",
        "1 huevo + 110g pavo cocido + 75g atun al natural",
        "1 huevo + 95g pavo cocido + 2 quesos frescos desnatados 0%",
      ],
      verduras: [
        "Ensalada",
        "Verduras u hortalizas",
      ],
      carbo: [
        "195g patata o batata",
        "45g arroz o pasta integral",
        "65g legumbres",
        "70g pan de cereales",
        "70g quinoa",
        "95g gnocchis",
        "2 tortillas de trigo integral (36g)",
      ],
      grasa: [
        "5g aceite de oliva",
      ],
    },
    bloque5: {
      proteina: [
        "240g pescado blanco o azul",
        "195g magro de ternera",
        "195g pollo deshuesado",
        "185g pavo deshuesado",
        "1 huevo + 110g pavo cocido + 75g atun al natural",
        "1 huevo + 95g pavo cocido + 2 quesos frescos desnatados 0%",
      ],
      verduras: [
        "Ensalada",
        "Verduras u hortalizas",
      ],
      grasa: [
        "5g aceite de oliva",
      ],
    },
  },
};

export const cloneDefaultMealPlan = () => JSON.parse(JSON.stringify(defaultMealPlan));

export default defaultMealPlan;
