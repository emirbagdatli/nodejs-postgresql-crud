const { response } = require('express');
const pool = require('../../db');
const queries = require('./queries');
const constants = require('../../constants');

const getStudents = async (req, res) => {
    await pool.query(queries.getStudents, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getStudentById = async (req, res) => {
    const id = parseInt(req.params.id);
    await pool.query(queries.getStudentById, [id], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};
const addStudent = async (req, res) => {
    const { name, email, age, dob } = req.body;

    try {
        // Check if email exists.
        const emailQuery = await pool.query(queries.chechkEmailExists, [email]);

        if (emailQuery.rows.length) {
            return res.send(constants.emailExists);
        }

        // If email not taken, add new student.
        await pool.query(
            queries.addStudent,
            [name, email, age, dob],
            (error, results) => {
                if (error) throw error;

                // 201 = success create.
                res.status(201).json({ message: constants.studentCreated });
            }
        );
    } catch (err) {
        console.error(constants.studentCreateError, error);
        res.status(500).json({ message: constants.internalServerError });
    }
};

const deleteStudentById = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        await pool.query(queries.getStudentById, [id], (error, results) => {
            const noStudentFound = !results.rows.length;
            if (noStudentFound) {
                return res.send(constants.studentDoesntExist);
            }
            pool.query(queries.deleteStudentById, [id], (error, results) => {
                if (error) throw error;
                res.status(200).json({ message: constants.studentRemoved });
            });
        });


    } catch (err) {
        console.error(constants.studentRemoveError, error);
        res.status().json({ message: constants.internalServerError });

    }
};

const updateStudent = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    try {
        await pool.query(queries.getStudentById, [id], (error, results) => {
            const noStudentFound = !results.rows.length;
            if (noStudentFound) {
                return res.send(constants.studentDoesntExist);
            }
            pool.query(queries.updateStudent, [name, id], (error, results) => {
                if (error) throw error;
                res.status(200).json({ message: constants.studentUpdated });
            });
        });

    } catch (err) {
        console.error(constants.studentUpdateError, error);
        res.status(500).json({ message: constants.internalServerError });

    }
};

module.exports = {
    getStudents,
    getStudentById,
    addStudent,
    deleteStudentById,
    updateStudent,
};