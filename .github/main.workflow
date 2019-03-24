workflow "New workflow" {
  on = "push"
  resolves = ["deploy"]
}

action "install" {
  uses = "docker://node:10"
  runs = "install"
  args = "yarn install"
}

action "deploy" {
  uses = "docker://node:10"
  needs = ["install"]
  args = ["bash", "-c", "yarn firebase deploy --token $FIREBASE_TOKEN"]
  secrets = ["FIREBASE_TOKEN"]
}
