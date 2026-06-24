pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    stages {
        stage('Clonar código') {
            steps {
                echo 'Código clonado desde GitHub ✅'
            }
        }
        stage('Instalar dependencias') {
            steps {
                sh 'node --version'
                sh 'npm install'
            }
        }
        stage('Correr tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Despliegue simulado') {
            steps {
                echo '🚀 Desplegando aplicación...'
                echo 'Despliegue completado ✅'
            }
        }
    }

    post {
        success { echo '✅ Pipeline exitoso' }
        failure { echo '❌ Pipeline falló — revisar logs' }
    }
}