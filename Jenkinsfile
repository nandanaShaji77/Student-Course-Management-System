pipeline {
    agent any

    environment {
        // Registry Credentials Identifier defined in Jenkins Credentials Manager
        DOCKER_CREDS = 'docker-hub-credentials'
        DOCKER_USER  = 'nandanasShaji' // Default registry organization namespace
        APP_VERSION  = "${BUILD_NUMBER}"
        
        // Environment profiles for Maven running on different build agents
        MAVEN_HOME   = tool name: 'Maven3', type: 'maven'
    }

    options {
        // Enforce timeouts and avoid hung pipeline runs
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        // Stage 1: SCM Checkout
        stage('SCM Checkout') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        // Stage 2: Java Compilation with Maven
        stage('Maven Compile & Build') {
            steps {
                echo 'Compiling and packaging Java Spring Boot backend...'
                dir('backend') {
                    sh "${MAVEN_HOME}/bin/mvn clean package -DskipTests"
                }
            }
        }

        // Stage 3: JUnit Test Suite Execution
        stage('Execute Unit Tests') {
            steps {
                echo 'Running unit test verifications with Maven...'
                dir('backend') {
                    sh "${MAVEN_HOME}/bin/mvn test"
                }
            }
        }

        // Stage 4: Docker Container Image Builds
        stage('Docker Image Builds') {
            steps {
                echo 'Building backend and frontend Docker containers...'
                sh 'docker compose build'
            }
        }

        // Stage 5: Publish Container Images to Docker Hub
        stage('Push Images to Docker Hub') {
            steps {
                echo 'Logging in and pushing compiled assets to registry...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", 
                                                 usernameVariable: 'DOCKER_USERNAME', 
                                                 passwordVariable: 'DOCKER_PASSWORD')]) {
                    // Authenticate CLI
                    sh "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                    
                    // Tag images for the organization namespace
                    sh "docker tag student-backend:latest ${DOCKER_USERNAME}/student-backend:latest"
                    sh "docker tag student-backend:latest ${DOCKER_USERNAME}/student-backend:${APP_VERSION}"
                    sh "docker tag student-frontend:latest ${DOCKER_USERNAME}/student-frontend:latest"
                    sh "docker tag student-frontend:latest ${DOCKER_USERNAME}/student-frontend:${APP_VERSION}"
                    
                    // Push to repository registry
                    sh "docker push ${DOCKER_USERNAME}/student-backend:latest"
                    sh "docker push ${DOCKER_USERNAME}/student-backend:${APP_VERSION}"
                    sh "docker push ${DOCKER_USERNAME}/student-frontend:latest"
                    sh "docker push ${DOCKER_USERNAME}/student-frontend:${APP_VERSION}"
                }
            }
        }

        // Stage 6: Automated Deployment using Docker Compose Orchestrator
        stage('Deploy Stack') {
            steps {
                echo 'Launching Student Course Management System containers...'
                // Restarts services gracefully with updated images
                sh 'docker compose down'
                sh 'docker compose up -d'
                echo 'Deploy completed. Ecosystem accessible on port 80.'
            }
        }
    }

    post {
        always {
            echo 'Performing workspace cleanups...'
            cleanWs()
        }
        success {
            echo '==================================================='
            echo ' Jenkins CD Execution Success: Deployment Active!  '
            echo '==================================================='
        }
        failure {
            echo '==================================================='
            echo ' Jenkins CD Execution Failure: Deployment Stopped! '
            echo '==================================================='
        }
    }
}
