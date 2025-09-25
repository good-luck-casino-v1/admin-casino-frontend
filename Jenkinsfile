pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: node
                    image: node:20-alpine
                    command:
                    - cat
                    tty: true
                    resources:
                      requests:
                        memory: "1Gi"
                        cpu: "500m"
                      limits:
                        memory: "2Gi"
                        cpu: "1000m"
                  - name: docker
                    image: docker:24-dind
                    securityContext:
                      privileged: true
                    env:
                    - name: DOCKER_TLS_CERTDIR
                      value: ""
                    resources:
                      requests:
                        memory: "512Mi"
                        cpu: "200m"
                      limits:
                        memory: "1Gi"
                        cpu: "500m"
            '''
        }
    }
    
    environment {
        REGISTRY_URL = 'registry.gitlab.com'
        REGISTRY_PATH = 'jssrinfotech/admin-casino-frontend'
        IMAGE_NAME = 'admin-casino'
        API_URL = 'https://admin.api.goodluck24bet.com'
        CI = 'false'
    }
    
    options {
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Source code already checked out by Jenkins'
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "prod-${new Date().format('yyyyMMdd-HHmm')}-${env.GIT_COMMIT_SHORT}"
                    env.FULL_IMAGE_NAME = "${env.REGISTRY_URL}/${env.REGISTRY_PATH}/${env.IMAGE_NAME}"
                }
                echo "Git commit: ${env.GIT_COMMIT_SHORT}"
                echo "Image tag: ${env.BUILD_TAG}"
                echo "Full image name: ${env.FULL_IMAGE_NAME}"
            }
        }
        
        stage('Build React App') {
            steps {
                container('node') {
                    echo 'Installing dependencies and building React application...'
                    sh '''
                        echo "Node.js version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        
                        export NODE_OPTIONS="--max-old-space-size=1536"
                        export CI=false
                        
                        echo "Installing dependencies..."
                        # Try npm ci first, fallback to npm install if lock file is out of sync
                        if npm ci --prefer-offline --no-audit; then
                            echo "npm ci completed successfully"
                        else
                            echo "npm ci failed due to lock file mismatch, using npm install as fallback..."
                            rm -f package-lock.json
                            npm install --prefer-offline --no-audit
                            echo "npm install completed successfully"
                        fi
                        
                        echo "Creating environment file..."
                        cat > .env.production << EOF
REACT_APP_API_URL=${API_URL}
REACT_APP_ENV=production
EOF
                        
                        echo "Environment configuration:"
                        cat .env.production
                        
                        echo "Building React application..."
                        npm run build
                        
                        echo "Build completed successfully!"
                        echo "Build size: $(du -sh build/)"
                        echo "Build contents:"
                        ls -la build/
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    echo 'Building Docker image...'
                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-jssr-infotech',
                        usernameVariable: 'REGISTRY_USER',
                        passwordVariable: 'REGISTRY_PASS'
                    )]) {
                        sh '''
                            echo "Waiting for Docker daemon..."
                            timeout 60 sh -c 'until docker info > /dev/null 2>&1; do sleep 2; done'
                            
                            echo "Docker version: $(docker --version)"
                            
                            echo "Logging into registry..."
                            echo "$REGISTRY_PASS" | docker login $REGISTRY_URL -u "$REGISTRY_USER" --password-stdin
                            
                            echo "Building Docker image with versioned tag..."
                            docker build -t ${FULL_IMAGE_NAME}:${BUILD_TAG} .
                            
                            echo "Tagging image as latest..."
                            docker tag ${FULL_IMAGE_NAME}:${BUILD_TAG} ${FULL_IMAGE_NAME}:latest
                            
                            echo "Verifying tags were created:"
                            docker images ${FULL_IMAGE_NAME}
                            
                            echo "Image built and tagged successfully"
                        '''
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                container('docker') {
                    echo 'Pushing Docker images to registry...'
                    sh '''
                        echo "=== Pushing versioned tag ==="
                        echo "Pushing: ${FULL_IMAGE_NAME}:${BUILD_TAG}"
                        docker push ${FULL_IMAGE_NAME}:${BUILD_TAG}
                        echo "✅ Versioned tag pushed successfully"
                        
                        echo ""
                        echo "=== Pushing latest tag ==="
                        echo "Pushing: ${FULL_IMAGE_NAME}:latest"
                        docker push ${FULL_IMAGE_NAME}:latest
                        echo "✅ Latest tag pushed successfully"
                        
                        echo ""
                        echo "=== Push Summary ==="
                        echo "✅ Versioned: ${FULL_IMAGE_NAME}:${BUILD_TAG}"
                        echo "✅ Latest: ${FULL_IMAGE_NAME}:latest"
                        echo ""
                        echo "Both images are now available in GitLab registry!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                try {
                    container('docker') {
                        echo 'Cleaning up Docker images...'
                        sh '''
                            if docker info > /dev/null 2>&1; then
                                echo "Cleaning up local images..."
                                docker rmi ${FULL_IMAGE_NAME}:${BUILD_TAG} || true
                                docker rmi ${FULL_IMAGE_NAME}:latest || true
                                docker image prune -f || true
                                echo "Cleanup completed"
                            else
                                echo "Docker daemon not available for cleanup"
                            fi
                        '''
                    }
                } catch (Exception e) {
                    echo "Cleanup skipped: ${e.getMessage()}"
                }
            }
        }
        success {
            echo """
            =============================
            ✅ BUILD & RELEASE SUCCESSFUL!
            =============================
            Build Number: ${BUILD_NUMBER}
            Git Commit: ${env.GIT_COMMIT_SHORT}
            
            🏷️  Tagged Images:
            • Versioned: ${env.FULL_IMAGE_NAME}:${env.BUILD_TAG}
            • Latest: ${env.FULL_IMAGE_NAME}:latest
            
            🚀 Admin Frontend ready for deployment!
            =============================
            """
        }
        failure {
            echo """
            =============================
            ❌ BUILD FAILED!
            =============================
            Build Number: ${BUILD_NUMBER}
            Git Commit: ${env.GIT_COMMIT_SHORT ?: 'Unknown'}
            
            Check the console output above for error details.
            =============================
            """
        }
    }
}
