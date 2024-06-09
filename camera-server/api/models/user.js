const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        const emailRegex =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(value);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

class UserService {
  constructor() {}

  async load(id) {
    try {
      const user = await User.findById(id).lean();
      if (user) {
        delete user.password;
      }
      return user;
    } catch (error) {
      throw new Error("User not found");
    }
  }

  async create(user) {
    try {
      const newUser = await User.create(user);
      return newUser;
    } catch (error) {
      throw new Error("Cannot create user");
    }
  }

  async login(email, password) {
    try {
      console.log("Login request received for email:", email);

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const passwordIsMatch = await bcrypt.compare(password, user.password);
      if (!passwordIsMatch) {
        throw new Error("Password does not match");
      }

      const TokenService = require("./token");
      const tokenService = new TokenService();
      const token = await tokenService.create(user._id);

      // Populate the user data in the token
      const populatedToken = {
        ...token.toObject(),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          created: user.created,
        },
      };

      // console.log("Token created successfully with user data:", populatedToken);

      return populatedToken;
    } catch (error) {
      console.error("Error during login:", error.message);
      throw new Error("Unauthorized");
    }
  }
}

module.exports = UserService;
