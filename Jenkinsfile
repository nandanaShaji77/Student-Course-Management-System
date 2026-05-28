pipeline {
    agent any

    tools {
        // Tells Jenkins to inject your managed Maven path into the build environment
        maven 'Maven3' 
    }

    environment {
        // Keeps your setup modular and easy to change later
        DOCKER_HUB_CRED = 'docker-hub-credentials' 
    }

    stages {
        stage('Compile & Package') {
            steps {
                echo 'Packaging application with Maven...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Execute Unit Tests') {
            steps {
                echo 'Running unit test verifications...'
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }

        stage('Docker Image Builds') {
            steps {
                echo 'Building backend and frontend Docker containers...'
                // Compose builds them directly with the correct repository tags now
                sh 'docker compose build'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Logging in and pushing compiled assets to registry...'
                // Using single quotes inside the block safely masks your credentials
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker compose push'
                }
            }
        }

        stage('Deploy Stack') {
            steps {
                echo 'Deploying application stack...'
                // Your deployment commands go here (e.g., docker compose up -d, or env substitution)
            }
        }
    }

    post {
        always {
            echo 'Performing workspace cleanups...'
            cleanWs()
        }
    }
}