import express from 'express';
import sanitizePrompts from '../utils/regexPatterns.js';


app.use((req,res,next)=> {
  if(req.body.prompt) {
    req.body.prompt= sanitizePrompts(req.body.prompt);
  }
  next();
})