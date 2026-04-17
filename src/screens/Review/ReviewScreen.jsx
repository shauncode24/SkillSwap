import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitReview,
  resetReviewState,
  selectReviewSubmitting,
  selectReviewError,
  selectSubmitSuccess
} from '../../redux/slices/reviewSlice';
import theme from '../../theme';

export default function ReviewScreen({ route, navigation }) {
  const { sessionId, revieweeId, revieweeName, requestId } = route.params;
  const dispatch = useDispatch();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitting = useSelector(selectReviewSubmitting);
  const error = useSelector(selectReviewError);
  const submitSuccess = useSelector(selectSubmitSuccess);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetReviewState());
        navigation.goBack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, dispatch, navigation]);

  useEffect(() => {
    return () => {
      dispatch(resetReviewState());
    };
  }, [dispatch]);

  const handleSubmit = () => {
    if (rating >= 1 && rating <= 5 && !submitting) {
      dispatch(submitReview({ sessionId, revieweeId, rating, comment }));
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(val => (
          <TouchableOpacity key={val} onPress={() => setRating(val)}>
             <Text style={[styles.starChar, rating >= val && styles.starFilled]}>
               {rating >= val ? <Ionicons name='star' size={32} color='#FFD700' /> : <Ionicons name='star-outline' size={32} color='#FFD700' />}
             </Text>
          </TouchableOpacity>
        ))}
        {rating > 0 && <Text style={styles.ratingNum}>{rating} / 5</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
         </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Review your session with {revieweeName}</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {submitSuccess ? (
           <View style={styles.successBox}>
              <Text style={styles.successText}>Review submitted successfully!</Text>
           </View>
        ) : (
          <>
            <View style={styles.ratingSection}>
               {renderStars()}
            </View>

            <View style={styles.commentSection}>
              <TextInput 
                style={styles.commentInput}
                placeholder="Share your experience (optional)"
                placeholderTextColor={theme.colors.subtext}
                multiline
                maxLength={500}
                value={comment}
                onChangeText={setComment}
              />
              <Text style={styles.charCount}>{comment.length} / 500</Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, (rating === 0 || submitting) && {opacity: 0.5}]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                 <ActivityIndicator color={theme.colors.background} />
              ) : (
                 <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 30,
  },
  ratingSection: {
    marginBottom: 30,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starChar: {
    fontSize: 40,
    color: theme.colors.border,
  },
  starFilled: {
    color: theme.colors.primary,
  },
  ratingNum: {
    marginLeft: 15,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    color: theme.colors.text,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.sm,
    marginTop: 5,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: theme.colors.background,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
  }
});
