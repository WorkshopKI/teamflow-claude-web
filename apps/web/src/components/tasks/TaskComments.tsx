'use client';

import { useState } from 'react';
import type { Task, Comment, PersonaId } from '@teamflow/types';
import { useTasks } from '@/hooks/useTasks';
import { usePersonas } from '@/hooks/usePersonas';
import { useActivities } from '@/hooks/useActivities';
import { formatRelativeTime } from '@teamflow/core';
import { nanoid } from 'nanoid';

interface TaskCommentsProps {
  task: Task;
  currentUserId: PersonaId;
}

export function TaskComments({ task, currentUserId }: TaskCommentsProps) {
  const { update } = useTasks();
  const { personas } = usePersonas();
  const { createActivity } = useActivities();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = task.comments || [];

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment: Comment = {
        id: nanoid(),
        content: newComment.trim(),
        author: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        mentions: [],
      };

      const updatedComments = [...comments, comment];
      update(task.id, { comments: updatedComments });

      // Log activity
      createActivity('comment_added', task.id, currentUserId, undefined, {
        commentId: comment.id,
        preview: comment.content.substring(0, 50),
      });

      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPersonaName = (personaId: PersonaId) => {
    const persona = personas.find((p) => p.id === personaId);
    return persona ? persona.name : 'Unknown';
  };

  const getPersonaAvatar = (personaId: PersonaId) => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return '?';
    return persona.type === 'ai' ? '🤖' : persona.name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 bg-secondary/50 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                {getPersonaAvatar(comment.author)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm">{getPersonaName(comment.author)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(comment.createdAt))}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-border pt-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
            {getPersonaAvatar(currentUserId)}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAddComment();
                }
              }}
              placeholder="Add a comment... (Cmd/Ctrl+Enter to submit)"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
