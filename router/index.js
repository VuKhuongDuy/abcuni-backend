const express = require('express');
const user = require('../controller/user');
const subject = require('../controller/subject');
const student = require('../controller/student');
const registed = require('../controller/registed');
const turn = require('../controller/turn');
const exam = require('../controller/exam');
const room = require('../controller/room');
let router = express.Router();

// API FOR ADMIN
router.get('/admin', user.checkAdmin);
router.get('/admin/list', user.getListAdmin);
router.get('/admin/student/', student.getAllStudent);
router.post('/admin/add', user.addAdmin);
router.post('/admin/user/add', user.addUser);
router.post('/admin/exam/add', exam.addExam);
router.post('/admin/regist', registed.registSubject)
router.post('/admin/room/add', room.addRoom);
router.post('/admin/student/add', student.addStudent);
router.post('/admin/subject/add', subject.addSubject);
router.post('/admin/subject/student', subject.addStudentSubject);
router.post('/admin/turn/add', turn.addTurn);
router.delete('/admin/:email', user.deleteAdmin);
router.delete('/admin/turn/:turn_id', turn.deleteTurn);
router.delete('/admin/regist/:registed_id', registed.deleteSubjectRegisted);
router.delete('/admin/room/:exam_id/:room_id', room.deleteRoom);
router.delete('/admin/student/delete/:mssv', student.deleteStudent);
router.delete('/admin/subject/delete/:exam_id/:code_subject', subject.deleteSubject);
router.delete('/admin/exam/:exam_name', exam.deleteExam);

// API FOR USER
router.get('/room/:exam_id', room.getAllRoom);
router.get('/student/:exam_id/:code_subject', subject.getStudentBySubject);
router.get('/regist/:exam_id/:subject_code', registed.getSubjectRegisted);
router.get('/regist/:exam_id', registed.getSubjectRegisted);
router.put('/changepassword', user.changePasswordUser);
router.get('/exam/', exam.getAllExam);
router.get('/subject/:exam_id', subject.getAllSubject);
router.get('/subject/student/:exam_id', subject.getSubjectByStudent);
router.get('/user', user.getUser);
router.get('/turn/', turn.getTurn);
router.post('/login', user.login);
router.post('/student/registSubject', student.registSubject);
router.delete('/student/:registed_id', student.deleteSubjectRegisted);

router.post('/admin/add', user.addAdmin);

module.exports = router;