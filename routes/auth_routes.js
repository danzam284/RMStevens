//import express, express router as shown in lecture code
import {Router} from 'express';
import * as helpers from '../helpers.js';
import { registerUser, loginUser } from '../data/users.js';
import { users, courses } from '../config/mongoCollections.js';
import { addCourse } from '../data/course.js';

const router = Router();

router.route('/').get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router
  .route('/register')
  .get(async (req, res) => {
    res.render('../views/register', {title: "register"});
  })
  .post(async (req, res) => {
    let emailAddress = req.body.emailAddressInput;
    let username = req.body.usernameInput;
    let password = req.body.passwordInput;
    let confirmedPassword = req.body.confirmPasswordInput;
    try {
      emailAddress = emailAddress.trim(); helpers.validateEmail(emailAddress);
      username = username.trim(); helpers.validateUsername(username);
      password = password.trim(); helpers.validatePassword(password);
      confirmedPassword = confirmedPassword.trim(); helpers.validatePassword(confirmedPassword);
      const userCollection = await users();

      //https://stackoverflow.com/questions/7101703/how-do-i-make-case-insensitive-queries-on-mongodb
      const usersWithEmail = await userCollection.findOne({'emailAddress': {'$regex': "^" + emailAddress + "$", $options: 'i'}});
      if (usersWithEmail) {
        throw Error("There is already a user with that email address.");
      }
      const usersWithUsername = await userCollection.findOne({'username': {'$regex': "^" + username + "$", $options: 'i'}});
      if (usersWithUsername) {
        throw Error("There is already a user with that username.");
      }
    } catch(e) {
      return res.status(400).render("../views/register", {error: e, title: "register"});
    }
    
    try {
      const register = await registerUser(emailAddress, username, password);
      if (register.insertedUser) {
        return res.redirect("/login");
      } else {
        return res.status(500).render("../views/register", {error: "Internal Server Error", title: "register"});
      }
    } catch(e) {
      return res.status(400).render("../views/register", {error: e, title: "register"});
    }
    });

router
  .route('/login')
  .get(async (req, res) => {
    res.render('../views/login', {title: "login"});
  })
  .post(async (req, res) => {
    let emailAddress = req.body.emailAddressInput;
    let password = req.body.passwordInput;
    try {
      emailAddress = emailAddress.trim(); helpers.validateEmail(emailAddress);
      password = password.trim(); helpers.validatePassword(password);
      req.session.user = await loginUser(emailAddress, password);
      res.redirect("/main");
    } catch(e) {
      res.status(400).render("../views/login", {error: e, title: "login"});
    }
  });

router.route('/main').get(async (req, res) => {
  const user = req.session.user;
  res.render('../views/main', {title: "main", username: user.username, email: user.emailAddress});
});

router
  .route('/create')
  .get(async (req, res) => {
    const courseCollection = await courses();
    const allCourses = await courseCollection.find({}).toArray();
    res.render('../views/create', {title: "create review", courses: allCourses});
  })
  .post(async (req, res) => {
    //TODO (validate inputs (make sure professor/course exist, ensure numbers are valid, etc), add new review as subdocument to user, add new review ID to both course and professor, and adjust their mean rating/difficulties)
  });

router
  .route('/addCourse')
  .get(async (req, res) => {
    res.render('../views/addCourse', {title: "add course"});
  })
  .post(async (req, res) => {
    let courseName = req.body.courseNameInput;
    try {
      courseName = courseName.trim(); helpers.validateCourseName(courseName);
    } catch(e) {
      return res.status(400).render("../views/addCourse", {error: e, title: "add course"});
    }

    try {
      const add = await addCourse(courseName);
      if (add.insertedCourse) {
        return res.redirect("/main");
      } else {
        return res.status(500).render("../views/addCourse", {error: "Internal Server Error", title: "add course"});
      }
    } catch(e) {
      return res.status(400).render("../views/addCourse", {error: e, title: "register"});
    }
  });


router.route('/logout').get(async (req, res) => {
  req.session.destroy();
  res.render('../views/logout', {title: "logout"});
});

export default router;