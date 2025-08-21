import { sequelize } from "../config/database.js";
import { User } from "./user.js";
import { MenuItem } from "./menuItem.js";
import { Reservation } from "./reservation.js";


export { sequelize, User, MenuItem, Reservation };