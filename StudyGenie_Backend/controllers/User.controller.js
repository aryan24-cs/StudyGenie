import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponce.js'
import { UploadOnCloudinary } from '../utils/Cloudinary.js'
import { User } from '../models/User.model.js'

const GenreateAccessRefreshToken = async (userId) => {
    try {
        console.log('Generating tokens for userId:', userId);
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const AccessToken = await user.GenerateAccessToken();
        const RefreshToken = await user.GenerateRefreshToken();
        user.RefreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });
        return { AccessToken, RefreshToken };
    } catch (error) {
        console.error('Token generation error:', error);
        throw new ApiError(500, "Access or refresh token failure: " + error.message);
    }
};


const creatingUser = AsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "Fields Are Empty!!");
    }

    const ExsistingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (ExsistingUser) {
        throw new ApiError(400, "User with this username or email already exists!!");
    }

    const UserObj = {
        username,
        email,
        password
    };

    try {
        const NewUser = await User.create(UserObj);
        const Createduser = await User.findById(NewUser?._id).select("-password");

        if (!Createduser) {
            throw new ApiError(400, "No user created!!");
        }

        return res
            .status(201) // Use 201 for resource creation
            .json(new ApiResponse(201, Createduser, "User created successfully"));
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            throw new ApiError(400, "Username or email already exists");
        }
        throw new ApiError(500, "Failed to create user: " + error.message);
    }
});


const LoginUser = AsyncHandler(async (req, res) => {
    console.log('Login request body:', req.body);
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
        throw new ApiError(400, "Password and either username or email are required");
    }

    const Finduser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!Finduser) {
        throw new ApiError(404, "Cannot find the username or email");
    }

    console.log('User found:', Finduser._id);
    const PassCheck = await Finduser.isPasswordCorrect(password);
    if (!PassCheck) {
        throw new ApiError(401, "Wrong Password");
    }

    const { AccessToken, RefreshToken } = await GenreateAccessRefreshToken(Finduser._id);

    const FinalUser = await User.findById(Finduser._id).select("-password -email");

    const option = {
        httpOnly: true,
        sameSite: "lax"
    };

    return res.status(200)
        .cookie("refreshToken", RefreshToken, option)
        .cookie("accessToken", AccessToken, option)
        .json(new ApiResponse(200, FinalUser, "Logged in successfully"));
});

const HistoryHandle = AsyncHandler(async (req, res) => {
    const filePath = req.file?.path
    const userCurrent = req.user._id
    const loadingCloudinary = await UploadOnCloudinary(filePath)
    if (!loadingCloudinary) {
        throw new ApiError(400, "file Loading error!!")
    }

    const FindUser = await User.findById(userCurrent)
    if (!FindUser) {
        throw new ApiError(400, "User not found !!")
    }

    FindUser.history.push({ ...loadingCloudinary })
    await FindUser.save()

    return res.status(200)
        .json(new ApiResponse(200, "file saved in History!!"))

})


const FetchUserId = AsyncHandler(async (req, res) => {
    const userid = req.user._id
    console.log(userid)

    if (!userid) {
        throw new ApiError(400, "error fetching id");
    }

    const userCred = await User.findById(userid)
    if (!userCred) {
        throw new ApiError(400, "Not found in the database!!")
    }
    const UserObj = {
        userid,
    }

    res.status(200)
        .json(new ApiResponse(200, UserObj, "userid fetched"))
})

export { creatingUser, LoginUser, HistoryHandle, FetchUserId }