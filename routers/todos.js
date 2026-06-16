const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// 1. GET all todos (할일 전체 목록 조회)
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// 2. GET a single todo by ID (특정 할일 상세 조회)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// 3. POST create a new todo (새로운 할일 생성)
router.post('/', async (req, res, next) => {
  try {
    const { text, category, priority } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const newTodo = new Todo({
      text: text.trim(),
      category: category || "other",
      priority: priority || "medium",
      completed: false
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    next(err);
  }
});

// 4. PATCH/Update a todo status or text (할일 수정)
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, category, priority, completed } = req.body;

    const updateData = {};
    if (text !== undefined) updateData.text = text.trim();
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    next(err);
  }
});

// 5. DELETE a todo (할일 삭제)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully", todo: deletedTodo });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
