import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("./lib/serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const defaultSizes = [
  { name: "UK 6",  },
  { name: "UK 7",  },
  { name: "UK 8",  },
  { name: "UK 9",  },
  { name: "UK 10",  },
  { name: "UK 11",  },
  { name: "UK 12",  },
  { name: "Local Size 40",  },
  { name: "Local Size 42",  },
  { name: "Local Size 44",  },
];

const defaultColors = [
  { name: "Red", value: "#FF0000",  },
  { name: "Gold", value: "#FFD700",  },
  { name: "Green", value: "#008000",  },
  { name: "Black", value: "#000000",  },
  { name: "White", value: "#FFFFFF",  },
  { name: "Blue", value: "#0000FF",  },
  { name: "Yellow", value: "#FFFF00",  },
  { name: "Brown", value: "#A52A2A",  },
];

const seedData = async () => {
  try {
    // Seed Sizes
    for (const size of defaultSizes) {
      await db.collection("sizes").add(size);
    }

    // Seed Colors
    for (const color of defaultColors) {
      await db.collection("colors").add(color);
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seedData();