import "dotenv/config";
import { sequelize } from "./models/index.js";
import { User } from "./models/user.js";
import { MenuItem } from "./models/menuItem.js";
import { Reservation } from "./models/reservation.js";
import bcrypt from "bcryptjs";

(async () => {
  try {
    await sequelize.sync({ force: true }); 
    console.log("Base de datos sincronizada");

    const pass = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@pizza.com",
      password: pass,
      role: "admin",
    });


    await MenuItem.bulkCreate([
      {
        name: "Margarita",
        description:
          "Salsa de tomate San Marzano, mozzarella fresca y albahaca.",
        price: 65.0,
        category: "pizza",
        image:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Pepperoni",
        description: "Mozzarella, salsa de tomate y pepperoni crujiente.",
        price: 72.0,
        category: "pizza",
        image:
          "https://www.recetasnestlecam.com/sites/default/files/styles/crop_article_banner_desktop_nes/public/2024-09/pizza-pepperoni-famosa-receta-con-pepperoni_2.webp?itok=h1oWkIx-",
      },
      {
        name: "Cuatro Quesos",
        description: "Mozzarella, gorgonzola, parmesano y provolone.",
        price: 78.0,
        category: "pizza",
        image:
          "https://www.hola.com/horizon/landscape/e8bb41b65869-pizzacuatroquesos-adob-t.jpg?im=Resize=(960),type=downsize",
      },
      {
        name: "Hawaiana",
        description: "Jamón, piña caramelizada y mozzarella.",
        price: 74.0,
        category: "pizza",
        image: "https://elmen.pe/wp-content/uploads/2023/05/Pizza-hawaiana.jpg",
      },
      {
        name: "Coca-Cola 600ml",
        description: "Bebida fría para acompañar.",
        price: 12.0,
        category: "bebida",
        image:
          "https://st2.depositphotos.com/1817018/7897/i/950/depositphotos_78973132-stock-photo-coca-cola-drink-glass-with.jpg",
      },
    ]);

    console.log("Datos iniciales insertados ");
    process.exit(0);
  } catch (err) {
    console.error("Error al sincronizar la base de datos :", err);
    process.exit(1);
  }
})();
