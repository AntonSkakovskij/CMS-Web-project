import express from 'express';
import {getTasks, createNewTask, changeTaskStatus} from "../controllers/tasks.controller.js";


const router = express.Router();

router.post('/gettasks', getTasks);
router.post('/create-task', createNewTask);
router.post('/change-status', changeTaskStatus);

export default router;