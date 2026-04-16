const computeMatches = (currentUser, allUsers) => {
  const matches = [];

  const currentUserLearnSkills = currentUser.learnSkills || [];
  const currentUserAvailability = currentUser.availability || [];

  for (const candidate of allUsers) {
    let skillScore = 0;
    let availabilityScore = 0;
    let ratingScore = 0;
    let activityScore = 0;

    const matchedSkills = [];

    // 1. Skill Score
    if (currentUserLearnSkills.length > 0) {
      let overlapCount = 0;
      let priorityBonus = 0;

      const candidateTeachSkills = candidate.teachSkills || [];
      const candidateTeachSkillNames = candidateTeachSkills
        .map(s => s.name?.toLowerCase())
        .filter(n => n); // filter out undefined/empty

      for (const learnSkill of currentUserLearnSkills) {
        const learnNameStr = learnSkill.name?.toLowerCase();
        if (learnNameStr && candidateTeachSkillNames.includes(learnNameStr)) {
          overlapCount++;
          matchedSkills.push(learnSkill.name);
          
          const priority = learnSkill.priority?.toLowerCase();
          if (priority === 'high') {
            priorityBonus += 0.2;
          } else if (priority === 'medium') {
            priorityBonus += 0.1;
          } // low adds 0
        }
      }

      const baseSkillScore = overlapCount / currentUserLearnSkills.length;
      skillScore = Math.min(1.0, baseSkillScore + priorityBonus);
    } else {
      skillScore = 0;
    }

    // 2. Availability Score
    if (currentUserAvailability.length > 0) {
      let overlappingDays = 0;
      const candidateDays = (candidate.availability || [])
        .map(a => a.day?.toLowerCase())
        .filter(d => d);
      
      for (const avail of currentUserAvailability) {
        const dayStr = avail.day?.toLowerCase();
        if (dayStr && candidateDays.includes(dayStr)) {
          overlappingDays++;
        }
      }
      availabilityScore = overlappingDays / currentUserAvailability.length;
    } else {
      availabilityScore = 0;
    }

    // 3. Rating Score
    const rating = candidate.rating || 0;
    ratingScore = rating / 5;

    // 4. Activity Score
    const createdAt = candidate.createdAt ? new Date(candidate.createdAt) : new Date();
    const daysSinceCreated = (new Date() - createdAt) / (1000 * 60 * 60 * 24);

    if (daysSinceCreated < 30) {
      activityScore = 1.0;
    } else if (daysSinceCreated <= 90) {
      activityScore = 0.5;
    } else {
      activityScore = 0.2;
    }

    // Final Score Calculation
    const totalScore = (skillScore * 0.7) + (availabilityScore * 0.1) + (ratingScore * 0.1) + (activityScore * 0.1);

    if (totalScore > 0) {
      matches.push({
        user: candidate,
        score: Math.round(totalScore * 100) / 100, // round to 2 decimal places
        matchedSkills
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

module.exports = {
  computeMatches
};
