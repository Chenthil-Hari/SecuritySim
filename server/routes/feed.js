import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Get all posts (with pagination)
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username avatar role')
            .populate({
                path: 'comments',
                match: { isDeleted: false },
                populate: { path: 'userId', select: 'username avatar role' }
            });

        const total = await Post.countDocuments({ isDeleted: false });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/post', auth, async (req, res) => {
    try {
        const { content, media } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Post content cannot be empty' });
        }

        const newPost = new Post({
            userId: req.user.id,
            content: content.trim(),
            media: media || undefined
        });

        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('userId', 'username avatar role');

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to create post: ' + error.message });
    }
});

// Delete a post
router.delete('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is author or admin (assuming req.user.role exists)
        if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        post.isDeleted = true;
        await post.save();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Toggle Like
router.post('/post/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.isDeleted) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userId = req.user.id;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Add a comment
router.post('/post/:id/comment', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content cannot be empty' });
        }

        const post = await Post.findById(req.params.id);
        if (!post || post.isDeleted) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const newComment = new Comment({
            postId: post._id,
            userId: req.user.id,
            content: content.trim()
        });

        await newComment.save();
        const populatedComment = await Comment.findById(newComment._id).populate('userId', 'username avatar role');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a comment
router.delete('/comment/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        comment.isDeleted = true;
        await comment.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;
