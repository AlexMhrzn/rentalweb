const User=require("../models/userModel.js");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

const addUser=async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({success:false,message:"All fields are required"});
        }

        const isUser = await User.findOne({where:{username}});
        const isemail = await User.findOne({where:{email}});
        if(isUser||isemail){
            return res.json({success:false,message:"User already exists"});
        }

        const hassed = await bcrypt.hash(password,10);

        const newUser=await User.create({
            username,
            email,
            password: hassed,
            phone: req.body.phone || null,
            profile_image: null
        });

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:newUser
        });

    }catch(error){
        res.status(500).json({message:"Error creating user",error: error.message});
    }
}

const addAdminUser=async(req,res)=>{
    try{
        const {username,email,password,adminSecret}=req.body;
        const secret=process.env.ADMIN_REGISTER_SECRET;
        if(!secret || secret.trim()===''){
            return res.status(500).json({success:false,message:"Admin registration is not configured"});
        }
        if(!adminSecret || adminSecret!==secret){
            return res.status(403).json({success:false,message:"Invalid admin secret"});
        }
        if(!username || !email || !password){
            return res.status(400).json({success:false,message:"All fields are required"});
        }

        const isUser = await User.findOne({where:{username}});
        const isemail = await User.findOne({where:{email}});
        if(isUser||isemail){
            return res.json({success:false,message:"User already exists"});
        }

        const hassed = await bcrypt.hash(password,10);

        const newUser=await User.create({
            username,
            email,
            password: hassed,
            role: 'admin'
        });

        res.status(201).json({
            success:true,
            message:"Admin account created successfully",
            user:newUser
        });

    }catch(error){
        res.status(500).json({message:"Error creating admin",error: error.message});
    }
}


const getAllUser=async(req,res)=>{
    try{
        const users=await User.findAll({attributes:{exclude:["password"]}});
        return res.json({success:true,users,message:"User fetched successfully"});        
    }catch(error){
        return res.status(500).json({message:"Error fetching users",error: error.message});
    }
}

const getUsersById=async(req,res)=>{
    try{
        const id=req.params.id;
        const user=await User.findByPk(id);
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        return res.json({
            success:true,
            user:{id:user.id,username:user.username},
            message:"User fetched successfully"
        });
    }catch(error){
        return res.status(500).json({
            message:"Error fetching user",
            error: error.message
        });
    }
}

const getActiveUsers = async (req, res) => {
  res.json({ message: "Get active users - to be implemented" });
};

const updateUser=async(req,res)=>{
    try{
        const {id}=req.params;
        const {username,email,password}=req.body;
        const user=await User.findByPk(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(username){
            const isexistinguser=await User.findOne({where:{username}});
            if(isexistinguser && isexistinguser.id!==user.id){
                return res.status(400).json({success:false,message:"User with that username exists"});
            }
        }


        let hassedPassword=user.password;
        if(password){
            hassedPassword=await bcrypt.hash(password,10);
        }
        await user.update({
            username:username|| user.username,
            email:email|| user.email,
            password:hassedPassword,
        });
        return res.status(200).json({success:true,message:"User updated successfully",user:{
            id:user.id
        }});
    }catch(error){
        return res.status(500).json({message:"Error updating user",error: error.message});
    }
}

const deleteUser=async(req,res)=>{
    try{
        const id=req.params.id;
        const user= await User.findByPk(id);
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }

        await user.destroy();

        return res.status(200).json({
            success:true,
            // user:{id:user.id,username:user.username},
            message:"User deleted"
        });
    }catch(error){
        return res.status(500).json({
            message:"Error",
            error:error.message
        })
    }
}

const logInUser=async(req,res)=>{
    try{
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "Server configuration error: JWT_SECRET is missing" });
        }
        const {email,password}=req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const user=await User.findOne({where:{email}});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const isvalidUser=await bcrypt.compare(password,user.password);

        if(!isvalidUser){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }

        const token=jwt.sign(
            {
                id:user.id,
                role:user.role,
                username:user.username,
                email:user.email
            },process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );

        return res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:{id:user.id,username:user.username,email:user.email,role:user.role}
        });


    }catch(error){
        return res.status(500).json({
            message:"Error logging in",
            error:error.message
        });
    }
}

const getMe = async (req, res) => {
  const id=req.user.id
  try {
    const user = await User.findByPk(id)
    return res.json({ 
        success:true,
        user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            phone: user.phone,
            role: user.role,
            profile_image: user.profile_image,
            createdAt: user.createdAt,
        },
        message: "User fetched successfully" 
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
}

// alias for new profile endpoint
const getProfile = async (req, res) => {
  return getMe(req, res);
};

const updateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { username, phone, email } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username) {
      const exists = await User.findOne({ where: { username } });
      if (exists && exists.id !== user.id) return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    if (email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.id !== user.id) return res.status(400).json({ success: false, message: 'Email already in use' });
    }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (req.body.bio !== undefined) updateData.bio = req.body.bio;
        if (req.file) updateData.profile_image = `uploads/${req.file.filename}`;

        await user.update(updateData);
        return res.json({
            success: true,
            message: 'Profile updated',
            user: { id: user.id, username: user.username, email: user.email, phone: user.phone, profile_image: user.profile_image, bio: user.bio },
        });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const id = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Passwords required' });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return res.json({ success: true, message: 'Password changed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
  }
};

module.exports={
    getAllUser,addUser,addAdminUser,getUsersById,getActiveUsers,updateUser,deleteUser,
    logInUser,getMe,getProfile,updateProfile,changePassword
}