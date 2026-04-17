import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateMyProfile } from '../../redux/slices/userSlice';

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Spanish', 'French', 
  'Guitar', 'Piano', 'Photography', 'Cooking', 'Yoga', 
  'Meditation', 'Design', 'Marketing', 'Writing', 
  'Public Speaking', 'Fitness', 'Drawing', 'Singing'
];

export default function OnboardingScreen({ navigation }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState(authUser?.name || '');
  const [bio, setBio] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const toggleTeachSkill = (skill) => {
    if (teachSkills.includes(skill)) {
      setTeachSkills(teachSkills.filter((s) => s !== skill));
    } else {
      setTeachSkills([...teachSkills, skill]);
    }
  };

  const toggleLearnSkill = (skill) => {
    if (learnSkills.includes(skill)) {
      setLearnSkills(learnSkills.filter((s) => s !== skill));
    } else {
      setLearnSkills([...learnSkills, skill]);
    }
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleSkipIntro = () => {
    setStep(5);
  };

  const handleFinish = async () => {
    setLoading(true);
    
    // Map string array to object array requested by backend
    const mappedTeachSkills = teachSkills.map(s => ({ name: s, level: 'intermediate' }));
    const mappedLearnSkills = learnSkills.map(s => ({ name: s, priority: 'medium' }));

    await dispatch(updateMyProfile({
      name,
      bio,
      teachSkills: mappedTeachSkills,
      learnSkills: mappedLearnSkills,
    }));
    
    setLoading(false);
    navigation.replace('MainTabs');
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View
            key={i}
            style={i === step ? styles.activeDot : styles.inactiveDot}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 1 && (
        <View style={styles.introContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>✨</Text>
          </View>
          <Text style={styles.introTitle}>Welcome to SkillSwap</Text>
          <Text style={styles.introSubtitle}>
            Exchange skills with people in your community. No money involved, just knowledge sharing.
          </Text>
        </View>
      )}

      {step === 2 && (
        <View style={styles.introContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👥</Text>
          </View>
          <Text style={styles.introTitle}>Find Your Match</Text>
          <Text style={styles.introSubtitle}>
            Discover people who want to learn what you know, and teach what you want to learn.
          </Text>
        </View>
      )}

      {step === 3 && (
        <View style={styles.introContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📅</Text>
          </View>
          <Text style={styles.introTitle}>Book Sessions</Text>
          <Text style={styles.introSubtitle}>
            Schedule skill-sharing sessions at times that work for both of you.
          </Text>
        </View>
      )}

      {step === 4 && (
        <View style={styles.introContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>💬</Text>
          </View>
          <Text style={styles.introTitle}>Connect & Learn</Text>
          <Text style={styles.introSubtitle}>
            Chat with your matches and start your learning journey together.
          </Text>
        </View>
      )}

      {step === 5 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Short Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself..."
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
          />
        </View>
      )}

      {step === 6 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Skills You Can Teach</Text>
          <Text style={styles.subtitle}>Select skills you'd like to share with others</Text>

          <View style={styles.grid}>
            {COMMON_SKILLS.map((skill) => {
              const selected = teachSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => toggleTeachSkill(skill)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.selectedCount}>{teachSkills.length} selected</Text>
        </View>
      )}

      {step === 7 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Skills You Want to Learn</Text>
          <Text style={styles.subtitle}>Select skills you'd like to learn from others</Text>

          <View style={styles.grid}>
            {COMMON_SKILLS.map((skill) => {
              const selected = learnSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => toggleLearnSkill(skill)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.selectedCount}>{learnSkills.length} selected</Text>
        </View>
      )}

      <View style={styles.footer}>
        {renderDots()}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={step === 7 ? handleFinish : handleNext}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.actionBtnText}>
              {step === 7 ? 'Get Started' : 'Continue →'}
            </Text>
          )}
        </TouchableOpacity>
        {step < 5 && (
          <TouchableOpacity onPress={handleSkipIntro} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Skip intro</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  introContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconEmoji: {
    fontSize: 40,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
  },
  introSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  skipBtn: {
    marginTop: 20,
    paddingVertical: 10,
  },
  skipBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  bioInput: {
    height: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  pill: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: '#3730A3', // darker purple, matching mockup loosely
    borderColor: '#6366F1',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  selectedCount: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  actionBtn: {
    backgroundColor: '#F97316', // bright orange from the mockup
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
