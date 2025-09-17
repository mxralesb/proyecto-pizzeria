import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  sequelize,
  User,
  MenuItem,
  InventoryItem,
  EmployeeRole,
} from "./models/index.js";

(async () => {
  try {
    await sequelize.sync({ force: true });

    const adminPass = await bcrypt.hash("admin123", 10);
    const clientPass = await bcrypt.hash("cliente123", 10);

    await User.bulkCreate([
      { name: "Admin", email: "admin@pizza.com", password: adminPass, role: "admin" },
      { name: "Cliente Demo", email: "cliente@pizza.com", password: clientPass, role: "cliente" },
    ]);

    await EmployeeRole.bulkCreate(
      [{ name: "Cocinero" }, { name: "Repartidor" }, { name: "Mesero" }, { name: "Cajero" }],
      { ignoreDuplicates: true }
    );

    const menuSeed = [
      { name: "Margarita", description: "Salsa de tomate San Marzano, mozzarella fresca y albahaca.", price: 65.0, category: "pizza", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1200&auto=format&fit=crop" },
      { name: "Pepperoni", description: "Mozzarella, salsa de tomate y pepperoni crujiente.", price: 72.0, category: "pizza", image: "https://www.sortirambnens.com/wp-content/uploads/2019/02/pizza-de-peperoni.jpg" },
      { name: "Hawaiana", description: "Jamón, piña caramelizada y mozzarella.", price: 74.0, category: "pizza", image: "https://elmen.pe/wp-content/uploads/2023/05/Pizza-hawaiana.jpg" },
      { name: "Cuatro Quesos", description: "Mozzarella, gorgonzola, parmesano y provolone.", price: 78.0, category: "pizza", image: "https://www.hola.com/horizon/landscape/e8bb41b65869-pizzacuatroquesos-adob-t.jpg?im=Resize=(960),type=downsize" },
      { name: "Barbacoa", description: "Pizza con salsa BBQ, pollo y cebolla.", price: 58.0, category: "pizza", image: "https://www.unileverfoodsolutions.es/dam/global-ufs/mcos/SPAIN/calcmenu/recipes/ES-recipes/general/pizza-barbacoa/main-header.jpg/jcr:content/renditions/cq5dam.thumbnail.desktop.jpeg" },
      { name: "Vegetariana", description: "Verduras frescas y mozzarella.", price: 48.0, category: "pizza", image: "https://www.revistapancaliente.co/wp-content/uploads/2024/09/Pizza_vegetariana.jpg" },
      { name: "Cannolis", description: "Clásico postre italiano.", price: 25.0, category: "postre", image: "https://imag.bonviveur.com/cannoli.webp" },
      { name: "Tiramisú", description: "Postre italiano de café y cacao.", price: 28.0, category: "postre", image: "https://www.paulinacocina.net/wp-content/uploads/2020/01/receta-de-tiramisu-facil-y-economico-1740483918.jpg.webp" },
      { name: "Brownie con Helado", description: "Brownie tibio con helado.", price: 30.0, category: "postre", image: "https://mandolina.co/wp-content/uploads/2020/11/brownie-con-helado-destacada.jpg" },
      { name: "Cheesecake", description: "Clásico pastel de queso.", price: 32.0, category: "postre", image: "https://peopleenespanol.com/thmb/6Tq_b0OR3IMWy59oD7NfWd6IrwI=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/cheesecake-facil-con-leche-condensada-2000-4160526441114bf3ad8f3409586a2c8a.jpg" },
      { name: "Coca-Cola 600ml", description: "Bebida fría para acompañar.", price: 12.0, category: "bebida", image: "https://st2.depositphotos.com/1817018/7897/i/950/depositphotos_78973132-stock-photo-coca-cola-drink-glass-with.jpg" },
      { name: "7-Up", description: "Bebida gaseosa.", price: 10.0, category: "bebida", image: "https://www.7up.com/images/simple-7up/image2.png" },
      { name: "Fanta de Naranja", description: "Bebida gaseosa sabor naranja.", price: 10.0, category: "bebida", image: "https://www.salvajeamericanburger.com/wp-content/uploads/sites/930/2024/04/Fanta-naranja-lata.jpeg" },
      { name: "Grappete", description: "Bebida gaseosa sabor uva.", price: 10.0, category: "bebida", image: "https://cemacogt.vtexassets.com/arquivos/ids/358618-1600-1600?v=638439173557770000&width=1600&height=1600&aspect=true" },
      { name: "Doctor Pepper", description: "Bebida gaseosa.", price: 12.0, category: "bebida", image: "https://latorremx.vtexassets.com/arquivos/ids/169309-800-auto?v=637828957401100000&width=800&height=auto&aspect=true" },
    ];

    await MenuItem.bulkCreate(menuSeed);

    const items = await MenuItem.findAll();
    await Promise.all(
      items.map((mi) =>
        InventoryItem.create({
          id_menu_item: mi.id,
          stock: 100,
          price: mi.price,
        })
      )
    );

    console.log("OK");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
