import { CourierState, OpsOrder } from "../../models/index.js";

export const CourierController = {
  myState: async (req, res) => {
    const userId = req.user.id;
    const [st] = await CourierState.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, is_available: false, current_ops_order_id: null },
    });
    res.json(st);
  },

  setState: async (req, res) => {
    const userId = req.user.id;
    const { available } = req.body;
    const [st] = await CourierState.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, is_available: false, current_ops_order_id: null },
    });
    st.is_available = !!available;
    await st.save();
    res.json(st);
  },

  myAssignments: async (req, res) => {
    const userId = req.user.id;
    const rows = await OpsOrder.findAll({
      where: { courier_user_id: userId, status: "PENDING" },
      order: [["createdAt", "DESC"]],
    });
    res.json(rows);
  },
};
