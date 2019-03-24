workflow "New workflow" {
  on = "push"
  resolves = ["deploy"]
}

action "Install" {
  uses = "docker://node:10"
  args = "yarn install"
}

action "deploy" {
  uses = "docker://node:10"
  needs = ["Install"]
  args = ["bash", "-c", "yarn firebase deploy --token $FIREBASE_TOKEN"]
  secrets = ["FIREBASE_TOKEN"]
}
