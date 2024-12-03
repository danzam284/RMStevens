import { users, courses, professors } from './config/mongoCollections.js';
import { addCourse } from './data/course.js';
import { addProfessor } from './data/professor.js';
import { registerUser } from './data/users.js';

describe("Test course-related functions", () => {
  test("Should add a course to the database", async () => {
    const courseCollection = await courses();

    //clean up
    await courseCollection.deleteOne({name: "CS 111"});

    await addCourse("CS 111");

    const course = await courseCollection.findOne({name: "CS 111"});

    expect(course).toBeDefined();

    //clean up
    await courseCollection.deleteOne({name: "CS 111"});
  });

  test("Should fail due to duplicate courses", async () => {
    const courseCollection = await courses();

    //clean up
    await courseCollection.deleteOne({name: "CS 111"});

    await addCourse("CS 111");
    try {
      await addCourse("CS 111");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("A course already exists with this name.");
    } 

    //clean up
    await courseCollection.deleteOne({name: "CS 111"});
  });

  test("Should fail due to bad naming conventions", async () => {
    try {
      await addCourse("ABC 999");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("Invalid course prefix.");
    } 
  });
});
  
describe("Test professor-related functions", () => {
  test("Should add a professor to the database", async () => {
    const professorCollection = await professors();

    //clean up
    await professorCollection.deleteOne({name: "Doesnt Exist"});

    await addProfessor("Doesnt",  "Exist");

    const professor = await professorCollection.findOne({name: "Doesnt Exist"});

    expect(professor).toBeDefined();

    //clean up
    await professorCollection.deleteOne({name: "Doesnt Exist"});
  });

  test("Should fail due to duplicate professors", async () => {
    const professorCollection = await professors();

    //clean up
    await professorCollection.deleteOne({name: "Doesnt Exist"});

    await addProfessor("Doesnt", "Exist");
    try {
      await addProfessor("Doesnt", "Exist");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("A professor already exists with this name.");
    } 

    //clean up
    await professorCollection.deleteOne({name: "Doesnt Exist"});
  });

  test("Should fail due to bad parameters", async () => {
    try {
      await addProfessor("First");
      expect(true).toBe(false);
    } catch(e) {
      expect(e.message).toBe("Cannot read properties of undefined (reading 'trim')");
    } 
  });

});
  
describe("Test user-related functions", () => {
  test("Should add a user to the database", async () => {
    const userCollection = await users();

    //clean up
    await userCollection.deleteOne({username: "FakeUser"});

    await registerUser("fakeEmail@stevens.edu", "FakeUser", "1Abcdefg!!");

    const user = await userCollection.findOne({username: "FakeUser"});

    expect(user).toBeDefined();

    //clean up
    await userCollection.deleteOne({username: "FakeUser"});
  });

  test("Should fail due to duplicate users", async () => {
    const userCollection = await users();

    //clean up
    await userCollection.deleteOne({username: "FakeUser"});

    await registerUser("fakeEmail@stevens.edu", "FakeUser", "1Abcdefg!!");
    try {
      await registerUser("fakeEmail@stevens.edu", "FakeUser", "1Abcdefg!!");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("There is already a user with that email address.");
    } 

    //clean up
    await userCollection.deleteOne({username: "FakeUser"});
  });

  test("Should fail due to bad password 1", async () => {
    try {
      await registerUser("fakeEmail@stevens.edu", "FakeUser", "1Abcdefg");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("Password does not meet requirements.");
    } 
  });

  test("Should fail due to bad password 2", async () => {
    try {
      await registerUser("fakeEmail@stevens.edu", "FakeUser", "Abcdefg!!");
      expect(true).toBe(false);
    } catch(e) {
      expect(e).toBe("Password does not meet requirements.");
    } 
  });

});