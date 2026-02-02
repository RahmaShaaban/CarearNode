// استدعاء الموديل مباشرة لتجنب مشاكل ملف index.js
const Subject = require('../models/Subject'); 

exports.getAllSubjects = async (req, res) => {
  try {
    // جلب كل المواد (الاسم والوصف)
    const subjects = await Subject.findAll({
      attributes: ['id', 'course_name', 'description'],
      order: [['course_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};