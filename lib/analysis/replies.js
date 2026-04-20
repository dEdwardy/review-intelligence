function replyIntro(cluster, appName) {
  if (cluster.type === 'bug') {
    return `Thanks for the report about ${cluster.label.toLowerCase()} in ${appName}.`;
  }

  if (cluster.type === 'pricing') {
    return `Thanks for the honest pricing feedback on ${appName}.`;
  }

  if (cluster.type === 'feature request') {
    return `Thanks for the suggestion on ${appName}.`;
  }

  if (cluster.type === 'support') {
    return `Sorry we missed you on support for ${appName}.`;
  }

  if (cluster.type === 'performance') {
    return `Thanks for flagging the performance issue in ${appName}.`;
  }

  return `Thanks for sharing feedback on ${appName}.`;
}

export function generateReplyDraft(cluster, appName) {
  const intro = replyIntro(cluster, appName);

  if (cluster.type === 'bug') {
    return `${intro} We are investigating the issue now and would appreciate a quick note with your device model and app version so we can narrow it down.`;
  }

  if (cluster.type === 'pricing') {
    return `${intro} We are reviewing the pricing copy and trial flow to make the value clearer. If you have a moment, tell us what would make the pricing feel fairer.`;
  }

  if (cluster.type === 'feature request') {
    return `${intro} We have logged this as a request and are keeping it on the roadmap. Please email us if there is a specific workflow you want to unblock.`;
  }

  if (cluster.type === 'support') {
    return `${intro} Please reach out through the support email so we can help directly and make sure the issue is tracked by the team.`;
  }

  if (cluster.type === 'performance') {
    return `${intro} We are profiling the slow path and aiming to reduce the wait. If you can share your device and app version, that would help a lot.`;
  }

  return `${intro} We appreciate the feedback and will keep improving the experience.`;
}
