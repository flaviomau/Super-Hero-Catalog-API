const app = require('../app'),
			chai = require('chai'),
			request = require('supertest')
			expect = chai.expect

let token = "",
    tokenStandard = "",
    user = {username:'test', password:'test', role:'Standard'}

describe('Super-Hero-Catalog-API tests (Users)', function() {

	describe('#Authentication Tests', function() { 								
		
		describe('#Try Execute Authentication ', function() { 
			it('should return invalid password error', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'', password: ''})
					.end(function(err, res) {
						expect(res.statusCode).to.equal(401)
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Unauthorized (missing username or password)')
						done()
					})
			})
		})
		
		describe('#Try Execute Authentication ', function() { 
			it('should return invalid password error', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'alfred', password: 'misterbruce2'})
					.end(function(err, res) {
						expect(res.statusCode).to.equal(401)
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Invalid Password')
						done()
					})
			})
		})

		describe('#Execute Authentication ', function() { 
			it('should return the token', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'alfred', password: 'misterbruce'})
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Authentication successful')
						token = res.body.data.token
						done()
					})
			})
		})
    })
    
	describe('#Users Tests', function() { 
		describe('#POST / users', function() { 
			it('should return new user data', function(done) { 
				request(app)
					.post('/users')
					.set('x-access-token', token)
					.send(user)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object')
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Create successful')
						user = res.body.data.users
						done()
					})
			})
		})

		describe('#Execute Authentication Standard user', function() { 
			it('should return the token for Standard user', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'robin', password:'misterbruce'})
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Authentication successful')
            			tokenStandard = res.body.data.token                      
						done()
					})
			})
		})

		describe('#GET / users', function() { 
			it('should return authorization error', function(done) { 
				request(app)
					.get('/users')
					.set('x-access-token', tokenStandard)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401)
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Unauthorized (low privilege)')
						done()
					})
			})
		})

		describe('#GET / users', function() { 
			it('should return authorization error', function(done) { 
				request(app)
					.get('/users')
					.set('x-access-token', '1234564879889787')
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401)
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Error: Not enough or too many segments')
						done()
					})
			})
		})

		describe('#GET / users', function() { 
			const alteredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFsZnJlZCIsInJvbGUiOiJBZG1pbiIsImV4cGlyZXMiOjE1MzM1NjUzNjA2MDl9.HGKKl_ffh6ZGgrxOP1YYXESbrhLo5SfoHez_zk3mn00'
			it('should return authorization error', function(done) {
				request(app)
					.get('/users')
					.set('x-access-token', alteredToken)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401)
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Error: Signature verification failed')
						done()
					})
			})
		})

		describe('#GET / users', function() { 
			const alteredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQWRtaW4iLCJleHBpcmVzIjoxNTMzNjUzNzI0Nzc1fQ.9hu0Bzonjz1H1b1gD8hk72e5iohhYXrm01qctaxpVoA'
			it('should return authorization error', function(done) {
				request(app)
					.get('/users')
					.set('x-access-token', alteredToken)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401)
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Unauthorized (token malformed)')
						done()
					})
			})
		})

		describe('#GET / users', function() { 
			const alteredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFsZnJlZCIsInJvbGUiOiJBZG1pbiIsImV4cGlyZXMiOjE1MzI0NDQxNzkxNTV9.yurb0LoLdnpeAhud3V_KVBXM7o7R8_ggBRTvZ7AwwLU'
			it('should return authorization error', function(done) {
				request(app)
					.get('/users')
					.set('x-access-token', alteredToken)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401)
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Unauthorized (token expired)')
						done()
					})
			})
		})

		user.username = 'test changed'
		describe('#PUT / users', function() { 
			it('should return success', function(done) { 
				request(app)
					.put('/users/' + user._id)
					.set('x-access-token', token)
					.send(user)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Update successful')
						done()
					})
			})
		})		

		describe('#DELETE / users', function() { 
			it('should return success', function(done) { 
				request(app)
					.delete('/users/' + user._id)
					.set('x-access-token', token)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Delete successful')
						done()
					})
			})
		})
		
		describe('#GET / users', function() { 
			it('should return the first page of users list', function(done) { 
				request(app)
					.get('/users')
					.set('x-access-token', token)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('List successful')
						expect(res.body.data.list).to.be.an('array')
						done()
					})
			})
		})
	})	
})
