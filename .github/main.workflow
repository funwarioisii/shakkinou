workflow "New workflow" {
  on = "push"
  resolves = ["deploy"]
}


action "deploy" {
  uses = "docker://node:10"
  args = ["bash", "-c", "yarn firebase deploy --token $FIREBASE_TOKEN"]
  secrets = ["FIREBASE_TOKEN"]
}
