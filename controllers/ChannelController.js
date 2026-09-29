import Channel from "../models/ChannelModel.js";



export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const admin = req.user.userId;
    console.log(admin,name,members)

    if (
      !name ||
      !members ||
      !Array.isArray(members)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    if (members.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "At least 2 members required",
      });
    }
    // REMOVE DUPLICATES
    const uniqueMembers = [
      ...new Set(members),
    ];
    // ADD ADMIN IF NOT EXISTS
    if (!uniqueMembers.includes(admin)) {
      uniqueMembers.push(admin);
    }
    const channel = await Channel.create({
      name: name.trim(),
      admin,
      members: uniqueMembers,
    });

    const populatedChannel =
      await Channel.findById(channel._id)
        .populate(
          "members",
          "_id username email image"
        )
        .populate(
          "admin",
          "_id username email image"
        );

    return res.status(201).json({
      success: true,
      message:
        "Channel created successfully",
      data: populatedChannel,
    });


  } catch (error) {
    console.log(error);
 
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChannels = async (req, res) => {
  try {
    const userId = req.user.userId;


    const channels = await Channel.find({
      members: userId,
    })
      .populate(
        "members",
        "_id username email image"
      )
      .populate(
        "admin",
        "_id username email image"
      )
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};