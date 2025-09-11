import "dotenv/config";
import bcrypt from "bcryptjs";

import {
  sequelize,
  User,
  MenuItem,
  Reservation,
  EmployeeRole,
  Employee,
  Cliente,
  Direccion,
  Telefono,
  Order,
  OrderItem,
  InventoryItem, // <— importante para crear stocks iniciales
} from "./models/index.js";

(async () => {
  try {
    // ⚠️ En desarrollo: fuerza recreación. En producción, usa { alter: true }.
    await sequelize.sync({ force: true });
    console.log("✅ Base de datos sincronizada");

    // Usuarios base
    const adminPass = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@pizza.com",
      password: adminPass,
      role: "admin",
    });

    const clientDemoPass = await bcrypt.hash("cliente123", 10);
    await User.create({
      name: "Cliente Demo",
      email: "cliente@pizza.com",
      password: clientDemoPass,
      role: "cliente",
    });

    const clienteLogin = await Cliente.create({
      nombre: "Cliente",
      apellido: "Demo",
      correo_electronico: "cliente@pizza.com",
      contrasena: clientDemoPass,
    });

    // Menú (incluye los adicionales que usa tu pantalla de inventario)
    const menuSeed = [
      { name: "Margarita", description: "Salsa de tomate San Marzano, mozzarella fresca y albahaca.", price: 65.0, category: "pizza", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1200&auto=format&fit=crop" },
      { name: "Pepperoni", description: "Mozzarella, salsa de tomate y pepperoni crujiente.", price: 72.0, category: "pizza", image: "https://www.sortirambnens.com/wp-content/uploads/2019/02/pizza-de-peperoni.jpg" },
      { name: "Hawaiana", description: "Jamón, piña caramelizada y mozzarella.", price: 74.0, category: "pizza", image: "https://elmen.pe/wp-content/uploads/2023/05/Pizza-hawaiana.jpg" },
      { name: "Cuatro Quesos", description: "Mozzarella, gorgonzola, parmesano y provolone.", price: 78.0, category: "pizza", image: "https://www.hola.com/horizon/landscape/e8bb41b65869-pizzacuatroquesos-adob-t.jpg?im=Resize=(960),type=downsize" },

      // Extras para inventario
      { name: "Barbacoa", description: "Pizza con salsa BBQ, pollo y cebolla.", price: 58.0, category: "pizza", image: "https://www.unileverfoodsolutions.es/dam/global-ufs/mcos/SPAIN/calcmenu/recipes/ES-recipes/general/pizza-barbacoa/main-header.jpg/jcr:content/renditions/cq5dam.thumbnail.desktop.jpeg" },
      { name: "Vegetariana", description: "Verduras frescas y mozzarella.", price: 48.0, category: "pizza", image: "https://www.revistapancaliente.co/wp-content/uploads/2024/09/Pizza_vegetariana.jpg" },

      // Postres
      { name: "Cannolis", description: "Clásico postre italiano.", price: 25.0, category: "postre", image: "https://imag.bonviveur.com/cannoli.webp" },
      { name: "Tiramisú", description: "Postre italiano de café y cacao.", price: 28.0, category: "postre", image: "https://www.paulinacocina.net/wp-content/uploads/2020/01/receta-de-tiramisu-facil-y-economico-1740483918.jpg.webp" },
      { name: "Brownie con Helado", description: "Brownie tibio con helado.", price: 30.0, category: "postre", image: "https://mandolina.co/wp-content/uploads/2020/11/brownie-con-helado-destacada.jpg" },
      { name: "Cheesecake", description: "Clásico pastel de queso.", price: 32.0, category: "postre", image: "https://peopleenespanol.com/thmb/6Tq_b0OR3IMWy59oD7NfWd6IrwI=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/cheesecake-facil-con-leche-condensada-2000-4160526441114bf3ad8f3409586a2c8a.jpg" },

      // Bebidas
      { name: "Coca-Cola 600ml", description: "Bebida fría para acompañar.", price: 12.0, category: "bebida", image: "https://st2.depositphotos.com/1817018/7897/i/950/depositphotos_78973132-stock-photo-coca-cola-drink-glass-with.jpg" },
      { name: "7-Up", description: "Bebida gaseosa.", price: 10.0, category: "bebida", image: "https://www.7up.com/images/simple-7up/image2.png" },
      { name: "Fanta de Naranja", description: "Bebida gaseosa sabor naranja.", price: 10.0, category: "bebida", image: "https://www.salvajeamericanburger.com/wp-content/uploads/sites/930/2024/04/Fanta-naranja-lata.jpeg" },
      { name: "Grappete", description: "Bebida gaseosa sabor uva.", price: 10.0, category: "bebida", image: "https://cemacogt.vtexassets.com/arquivos/ids/358618-1600-1600?v=638439173557770000&width=1600&height=1600&aspect=true" },
      { name: "Doctor Pepper", description: "Bebida gaseosa.", price: 12.0, category: "bebida", image: "https://latorremx.vtexassets.com/arquivos/ids/169309-800-auto?v=637828957401100000&width=800&height=auto&aspect=true" },
    ];

    await MenuItem.bulkCreate(menuSeed);

    // Roles y empleados demo
    const roles = await EmployeeRole.bulkCreate(
      [
        { name: "Cocinero" },
        { name: "Repartidor" },
        { name: "Mesero" },
        { name: "Cajero" },
      ],
      { returning: true }
    );
    const rolId = (nombre) => roles.find((r) => r.name === nombre)?.id;

    await Employee.bulkCreate([
      {
        cui: "1234567890101",
        primer_nombre: "Juan",
        segundo_nombre: "Carlos",
        primer_apellido: "Pérez",
        segundo_apellido: "López",
        telefono: "5555-1111",
        telefono_emergencia: "5555-0000",
        fecha_contratacion: "2024-01-10",
        salario: 4500.0,
        activo: true,
        rol_id: rolId("Cocinero"),
      },
      {
        cui: "2345678901212",
        primer_nombre: "María",
        primer_apellido: "Gómez",
        telefono: "5555-2222",
        fecha_contratacion: "2024-03-05",
        salario: 4200.0,
        activo: true,
        rol_id: rolId("Mesero"),
      },
      {
        cui: "3456789012323",
        primer_nombre: "Luis",
        primer_apellido: "Ruiz",
        telefono: "5555-3333",
        fecha_contratacion: "2024-05-20",
        salario: 4300.0,
        activo: true,
        rol_id: rolId("Repartidor"),
      },
    ]);

    // Cliente y datos de contacto demo
    const passCliente = await bcrypt.hash("cliente123", 10);
    const c1 = await Cliente.create({
      nombre: "Juan",
      apellido: "Pérez",
      correo_electronico: "juan@correo.com",
      contrasena: passCliente,
    });

    await Direccion.bulkCreate([
      {
        id_cliente: c1.id_cliente,
        tipo_direccion: "Casa",
        calle: "Calle Falsa 123",
        ciudad: "Guatemala",
        estado: "Guatemala",
        codigo_postal: "01010",
      },
      {
        id_cliente: c1.id_cliente,
        tipo_direccion: "Oficina",
        calle: "Av. Reforma 456",
        ciudad: "Guatemala",
        estado: "Guatemala",
        codigo_postal: "01011",
      },
    ]);

    await Telefono.bulkCreate([
      { id_cliente: c1.id_cliente, numero: "55551111", tipo: "Movil" },
      { id_cliente: c1.id_cliente, numero: "22223333", tipo: "Casa" },
    ]);

    // === Inventario inicial (coincide con tu UI) ===
    const allMenu = await MenuItem.findAll();
    const mapByName = (n) => allMenu.find((m) => m.name === n);

    const inventorySeed = [
      { name: "Margarita", stock: 120, price: 50 },
      { name: "Pepperoni", stock: 95, price: 55 },
      { name: "Hawaiana", stock: 60, price: 52 },
      { name: "Cuatro Quesos", stock: 40, price: 60 },
      { name: "Barbacoa", stock: 25, price: 58 },
      { name: "Vegetariana", stock: 15, price: 48 },
      { name: "Cannolis", stock: 50, price: 25 },
      { name: "Tiramisú", stock: 30, price: 28 },
      { name: "Brownie con Helado", stock: 20, price: 30 },
      { name: "Cheesecake", stock: 10, price: 32 },
      { name: "Coca-Cola 600ml", stock: 150, price: 12 },
      { name: "7-Up", stock: 100, price: 10 },
      { name: "Fanta de Naranja", stock: 90, price: 10 },
      { name: "Grappete", stock: 60, price: 10 },
      { name: "Doctor Pepper", stock: 40, price: 12 },
    ];

    for (const row of inventorySeed) {
      const mi = mapByName(row.name);
      if (!mi) continue;
      await InventoryItem.create({
        id_menu_item: mi.id,
        stock: row.stock,
        price: row.price, // opcional (precio de inventario)
      });
    }

    // Órdenes demo (igual que antes)
    const byName = (n) => allMenu.find((m) => m.name === n);
    const pizza4q = byName("Cuatro Quesos");
    const pepperoni = byName("Pepperoni");
    const coca = byName("Coca-Cola 600ml");

    {
      const items = [
        { menuItem: pizza4q, qty: 1 },
        { menuItem: coca, qty: 2 },
      ];
      const subtotal = items.reduce((acc, it) => acc + it.menuItem.price * it.qty, 0);
      const tax = +(subtotal * 0.12).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      const order = await Order.create({
        id_cliente: clienteLogin.id_cliente,
        subtotal,
        tax,
        total,
        metodo_pago: "tarjeta",
        estado: "pagada",
      });

      for (const it of items) {
        await OrderItem.create({
          id_order: order.id_order,
          id_menu_item: it.menuItem.id,
          name: it.menuItem.name,
          price: it.menuItem.price,
          qty: it.qty,
        });
      }
    }

    {
      const items = [
        { menuItem: pepperoni, qty: 1 },
        { menuItem: coca, qty: 1 },
      ];
      const subtotal = items.reduce((acc, it) => acc + it.menuItem.price * it.qty, 0);
      const tax = +(subtotal * 0.12).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      const order = await Order.create({
        id_cliente: c1.id_cliente,
        subtotal,
        tax,
        total,
        metodo_pago: "efectivo",
        estado: "pagada",
      });

      for (const it of items) {
        await OrderItem.create({
          id_order: order.id_order,
          id_menu_item: it.menuItem.id,
          name: it.menuItem.name,
          price: it.menuItem.price,
          qty: it.qty,
        });
      }
    }

    console.log("🍕 Datos iniciales insertados (usuarios, menú, inventario, roles, empleados, clientes, órdenes)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al sincronizar:", err);
    process.exit(1);
  }
})();
