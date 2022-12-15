import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import AuthController from '../controllers/auth';
import UserController from '../controllers/users';

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

router.post('/', CheckAuth, UserController.addUser);
router.get('/list', CheckAuth, UserController.getAllUsers);
router.get('/current-user', CheckAuth, UserController.getCurrentUser);

router.put('/:id', CheckAuth, UserController.updateUser);
router.patch('/:id', CheckAuth, UserController.patchUser);

export default router;
