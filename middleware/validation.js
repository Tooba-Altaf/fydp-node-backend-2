const {check,validationResult}=require ('express-validator')

exports.registerManufacturerValidation=[
    check('email')
    .isEmail().withMessage('Invalid email!')
    .isLength({min:6, max:256}).withMessage("Email should be atleast 6 to 256 characters long"),

    check('password').trim().not().isEmpty().withMessage('Password is empty')
    .isLength({min:6,max:20}).withMessage("Password should be 6 to 20 characters long").matches( /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%#?&])[A-Za-z\d@$!%#?&]{6,20}$/),

    check('name').trim().not().isEmpty().withMessage('Name is empty').isLength({min:3}).withMessage("Name should be minimum 3 characters long"),

    check('type').not().isEmpty(),

    check('license').trim().not().isEmpty().withMessage("license number is empty").matches(/^[0-9]+$/).isLength({min:9,max:9}).withMessage("Invalid license number"),
    check('location').trim().not().isEmpty().withMessage("location is empty").isLength({min:10}).withMessage("Very short location"),
    check('contact').trim().not().isEmpty().withMessage(" contact is empty").isLength({min:11}).matches(/^[0-9]+$/).withMessage("Contact should be 11 numbers long"),
];
exports.registerStaffValidation=[
    check('email')
    .isEmail().withMessage('Invalid email!')
    .isLength({min:6, max:256}).withMessage("Email should be atleast 6 to 256 characters long"),

    check('name').trim().not().isEmpty().withMessage('Name is empty').isLength({min:3}).withMessage("Name should be minimum 3 characters long"),

    check('type').not().isEmpty(),

    check('contact').trim().not().isEmpty().withMessage(" contact is empty").isLength({min:11}).matches(/^[0-9]+$/).withMessage("Contact should be 11 numbers long"),
    
    check('gender').isIn(['Male','Female','Other']).notEmpty().withMessage("Gender is empty"),
    
    check('date_of_birth').trim().not().isEmpty().withMessage(" DOB is empty"),
    
    check('cnic').trim().not().isEmpty().withMessage(" contact is empty").isLength({min:11}).matches(/^[0-9]+$/).withMessage("Contact should be 11 numbers long")
]

exports.loginValidation=[
    check('email')
    .isEmail().withMessage('Invalid email!')
    .isLength({min:6, max:256}).withMessage("Email should be atleast 6 to 256 characters long"),

    check('password').trim().not().isEmpty().withMessage('Password is empty')
    .isLength({min:6,max:20}).withMessage("Password should be 6 to 20 characters long").matches( /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%#?&])[A-Za-z\d@$!%#?&]{6,20}$/)
]
exports.forgetPasswordVaildation=[
    check('email')
    .isEmail().withMessage('Invalid email!')
    .isLength({min:6, max:256}).withMessage("Email should be atleast 6 to 256 characters long"),
]