import { MenuItem } from "../../models/menuItem.js";

export const listMenu = async (req,res)=>{ 
  const items = await MenuItem.findAll({ order:[["id","ASC"]] });
  res.json(items);
};
export const createItem = async (req,res)=>{
  const item = await MenuItem.create(req.body);
  res.json(item);
};
export const updateItem = async (req,res)=>{
  const { id } = req.params;
  await MenuItem.update(req.body, { where:{ id }});
  const updated = await MenuItem.findByPk(id);
  res.json(updated);
};
export const removeItem = async (req,res)=>{
  const { id } = req.params;
  await MenuItem.destroy({ where:{ id }});
  res.json({ ok:true });
};
