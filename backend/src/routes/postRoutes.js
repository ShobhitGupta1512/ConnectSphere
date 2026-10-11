import express from "express";

const router = express.Router();

// Post routes
router.get("/", (req, res) => {
    res.json({ message: "Get all posts" });
});

router.get("/:id", (req, res) => {
    res.json({ message: "Get post by ID", postId: req.params.id });
});

router.post("/", (req, res) => {
    res.json({ message: "Create new post" });
});

router.put("/:id", (req, res) => {
    res.json({ message: "Update post", postId: req.params.id });
});

router.delete("/:id", (req, res) => {
    res.json({ message: "Delete post", postId: req.params.id });
});

export default router;
