import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../ui/toast';
import type { Review } from '../../types/property';

interface Props {
  propertyId: number;
  propertyRetailerId: number;
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 text-xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          {star <= (hover || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')}
    </span>
  );
}

export function ReviewSection({ propertyId, propertyRetailerId }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', propertyId],
    queryFn: () => api.get(`/properties/${propertyId}/reviews`).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      api.post(`/properties/${propertyId}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', propertyId] });
      setRating(0);
      setComment('');
      toast('Review submitted!', 'success');
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || 'Failed to submit review', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', propertyId] });
      toast('Review deleted', 'success');
    },
  });

  const ownReview = user ? reviews.find((r) => r.userId === user.id) : null;
  const isOwner = user ? user.id === propertyRetailerId : false;

  const handleSubmit = () => {
    if (!rating) return;
    createMutation.mutate({ rating, comment: comment || undefined });
  };

  const handleEditStart = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleEditSave = (reviewId: number) => {
    if (!editRating) return;
    createMutation.mutate({ rating: editRating, comment: editComment || undefined });
    handleEditCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const isOwn = user && review.userId === user.id;
              return (
                <div key={review.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {review.user.firstName ?? 'User'} {review.user.lastName ?? ''}
                      </span>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {isOwn && user && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleEditStart(review)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive"
                            onClick={() => deleteMutation.mutate(review.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {editingReviewId === review.id ? (
                    <div className="mt-2 space-y-2">
                      <StarInput value={editRating} onChange={setEditRating} />
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded border p-2 text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditSave(review.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    review.comment && (
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}

        {user && !isOwner && !ownReview && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Write a review</p>
            <StarInput value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full rounded border p-2 text-sm"
              rows={3}
            />
            <Button
              size="sm"
              disabled={!rating || createMutation.isPending}
              onClick={handleSubmit}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
