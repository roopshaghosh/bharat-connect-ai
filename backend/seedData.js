const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Opportunity = require("./models/Opportunity");

const uri = process.argv[2];

if (!uri) {
  console.error("Please provide your MongoDB Atlas URI as an argument.");
  console.error("Example: node seedData.js mongodb+srv://...");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to live database...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    console.log("Clearing old data...");
    await User.deleteMany();
    await Opportunity.deleteMany();

    console.log("Creating Users...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const ngoUser = await User.create({
      name: "Helping Hands NGO",
      email: "ngo@example.com",
      password: hashedPassword,
      role: "organization",
      location: "Delhi, India",
      impactScore: 500
    });

    const volunteerUser = await User.create({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: hashedPassword,
      role: "volunteer",
      location: "Delhi, India",
      skills: ["Teaching", "Web Development"],
      impactScore: 120
    });

    console.log("Creating Opportunities...");
    await Opportunity.create([
      {
        title: "Weekend Teaching Drive",
        description: "Looking for volunteers to teach basic mathematics and english to underprivileged children this weekend.",
        organization: ngoUser._id,
        category: "Education",
        location: "Delhi",
        date: new Date(Date.now() + 86400000 * 2), // 2 days from now
        skillsRequired: ["Teaching", "Communication"],
        urgency: "medium",
        format: "in-person",
        impactPoints: 50
      },
      {
        title: "Build NGO Website",
        description: "We need a skilled developer to help us revamp our charity website to reach more donors.",
        organization: ngoUser._id,
        category: "Technology",
        location: "Remote",
        date: new Date(Date.now() + 86400000 * 5),
        skillsRequired: ["Web Development", "React"],
        urgency: "high",
        format: "virtual",
        impactPoints: 100
      },
      {
        title: "City Cleanup Drive",
        description: "Join us for a massive city cleanup drive to promote environmental awareness and hygiene.",
        organization: ngoUser._id,
        category: "Environment",
        location: "Mumbai",
        date: new Date(Date.now() + 86400000 * 7),
        skillsRequired: ["Teamwork"],
        urgency: "low",
        format: "in-person",
        impactPoints: 30
      }
    ]);

    console.log("✅ Database successfully seeded with dummy data for judges!");
    console.log("You can log in to your live site using:");
    console.log("NGO Email: ngo@example.com | Password: password123");
    console.log("Volunteer Email: rahul@example.com | Password: password123");
    process.exit(0);

  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
