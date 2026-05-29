import { Router } from "express";
import userController from "../controllers/userController.js";
const userRouter = Router();
userRouter.get("/is/roles", userController.getUsersByRole);
userRouter.post("/users", userController.createUser);
userRouter.get("/users/:id", userController.getUserById);
userRouter.get("/users/username/:username", userController.getUserByUsername);
userRouter.put("/users/:id", userController.updateUser);
userRouter.delete("/users/:id", userController.deleteUser);
userRouter.get("/users", userController.getAllUsers);
userRouter.post("/users/login", userController.login);

export default userRouter;
