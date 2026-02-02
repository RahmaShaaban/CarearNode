const { Subject, TechSkill } = require('../models'); // استدعاء المودلز بعد الربط

exports.getAllCoursesWithSkills = async (req, res) => {
  try {
    const courses = await Subject.findAll({
      attributes: ['id', 'course_name', 'description'], // ما نحتاجه من جدول المواد
      include: [
        {
          model: TechSkill,
          as: 'skills', // نفس الـ alias المستخدم في العلاقة
          attributes: ['id', 'name'], // ما نحتاجه من جدول المهارات
          through: {
            attributes: [] // هذا السطر مهم لإخفاء بيانات الجدول الوسيط المزعجة
          }
        }
      ],
      order: [['course_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};