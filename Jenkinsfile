#!groovy

try {
  node('predixci-node6.9') {
    def nodePath = tool 'node-7.4.0'
    env.PATH = "${nodePath}/bin:${env.PATH}"

    def server = Artifactory.server('R2-artifactory')

    def branchName = env.BRANCH_NAME
    def shortCommit

    stage('Checkout') {
      echo "Checking out ${branchName}"
      checkout scm
    }

    stage('Build') {
      // Most typical, if you're not cloning into a sub directory
      gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
      // short SHA, possibly better for chat notifications, etc.
      shortCommit = gitCommit.take(6)
      echo shortCommit

      echo 'Installing dependencies'
      // Uncomment the following line to enable Artifactory caching with npm install. May run into issues with scoped packages. Please report if you do.
      // sh "npm config set registry ${server.getUrl()}/api/npm/npm-virtual"
      // sh "export bower_registry__search='[${server.getUrl()}/api/bower/bower-virtual, http://bower.herokuapp.com]'"
      sh 'npm install'

      echo 'Packaging artifact'
      sh "tar cvf predix-nodejs-starter-${env.BUILD_NUMBER}.tar dist/"

      stash includes: '*.tar', name: 'artifact'
      stash includes: 'manifest.yml', name: 'manifest'

      echo 'Deploying artifact to Artifactory'
      def uploadSpec = """{
        "files": [
          {
            "pattern": "*.tar",
            "target": "libs-release-local/predix-nodejs-starter-${env.BUILD_NUMBER}/"
          }
        ]
      }"""

      def buildInfo = server.upload(uploadSpec)
      server.publishBuildInfo(buildInfo)
    }

    /*
        stage('Test') {
          echo 'Running unit & integration tests'
          sh 'npm test'
        }
    */

/*
    stage('Deploy to Dev') {
      pcdOutput = sh(returnStatus: true, script: 'pcd')
      if(pcdOutput == 0)
      {
        echo "PCD tool is available"
        api_url = "deployer-api-devops-dev.run.aws-usw02-pr.ice.predix.io"
        domain_url = "run.aws-usw02-pr.ice.predix.io"
        metastore_url = "metastore-devops-dev.run.aws-usw02-pr.ice.predix.io"
        org ="<org_goes_here>"
        space = "<space_goes_here>"
        user_name = "<User_id_goes_here>"
        token_id = "<token_goes_here>"

        unstash 'artifact'
        unstash 'manifest'
        artifact_url = "*.tar"
        manifest_url ="*.yml"
        build_number = "${env.BUILD_NUMBER}"
        app_name = "predix-nodejs-starter"
        deploy("${api_url}","${domain_url}","${metastore_url}","${org}","${space}","${user_name}","${token_id}","${artifact_url}","${manifest_url}","${build_number}","${app_name}");
      }
      else{
          echo "PCD tool not found"
      }
    }

    if(branchName == "master"){
      promoteToStaging();
      waitForApproval();
      promoteToProduction();
    }
    */
  }
} catch(err) {
  throw err
}

def deploy( api_url,domain_url,metastore_url,org,space,user_name,token_id,artifact_url,manifest_url,build_number,app_id,version,app_name){
  echo "Authenticating for deploy"
  sh 'pcd deploy auth -a ${api_url} -d ${domain_url} -m${metastore_url} -o ${org} -s${space} -u ${user_name} -tid ${token_id}'
  echo "Authentication done"
  echo "Deploying the artifacts"
  sh 'pcd deploy -ar ${artifact_url} -m ${manifest_url} -b ${build_number} -id ${app_id} -v ${version} -n ${app_name}'
  echo "Deployed the artifacts"
}


def promoteToStaging(){
  stage("Promote to stage") {
    pcdOutput = sh(returnStatus: true, script: 'pcd')
    if(pcdOutput == 0)
    {
      echo "PCD tool is available"
      api_url = "deployer-api-devops-dev.run.aws-usw02-pr.ice.predix.io"
      domain_url = "run.aws-usw02-pr.ice.predix.io"
      metastore_url = "metastore-devops-dev.run.aws-usw02-pr.ice.predix.io"
      org ="<org_goes_here>"
      space = "<space_goes_here>"
      user_name = "<User_id_goes_here>"
      token_id = "<token_goes_here>"

      unstash 'artifact'
      unstash 'manifest'
      artifact_url = "*.tar"
      manifest_url ="*.yml"
      build_number = "${env.BUILD_NUMBER}"
      app_name = "predix-nodejs-starter"
      deploy("${api_url}","${domain_url}","${metastore_url}","${org}","${space}","${user_name}","${token_id}","${artifact_url}","${manifest_url}","${build_number}","${app_name}");
    }
    else{
      echo "PCD tool not found"
    }
  }

  stage("Integration test") {
    echo "integration test"
    sleep 10
    echo "integration test"
  }

  stage("Compliance test") {
    echo "Compliance test"
    sleep 10
    echo "Compliance test"
  }
}

def waitForApproval(){
  stage("Ready to go production?") {
    echo "Wait for input"
    sleep 10
    echo "input recieved"
  }
}

def promoteToProduction(){
  stage("Promote to production") {
    pcdOutput = sh(returnStatus: true, script: 'pcd')
    if(pcdOutput == 0)
    {
      echo "PCD tool is available"
      api_url = "deployer-api-devops-dev.run.aws-usw02-pr.ice.predix.io"
      domain_url = "run.aws-usw02-pr.ice.predix.io"
      metastore_url = "metastore-devops-dev.run.aws-usw02-pr.ice.predix.io"
      org ="<org_goes_here>"
      space = "<space_goes_here>"
      user_name = "<User_id_goes_here>"
      token_id = "<token_goes_here>"

      unstash 'artifact'
      unstash 'manifest'
      pom = readMavenPom file: 'pom.xml'
      artifact_url = "*.jar"
      manifest_url ="*.yml"
      build_number = "${env.BUILD_NUMBER}"
      app_name = "predix-nodejs-starter"
      deploy("${api_url}","${domain_url}","${metastore_url}","${org}","${space}","${user_name}","${token_id}","${artifact_url}","${manifest_url}","${build_number}","${app_name}");
    }
    else{
      echo "PCD tool not found"
    }
  }

  stage("Acceptance test") {
    echo "Acceptance test"
    sleep 10
    echo "Acceptance test"
  }
}
