'use stricts'

const app = require('../app'),
			chai = require('chai'),
			request = require('supertest')
			expect = chai.expect,
			io = require('socket.io-client'),
      socketUrl = 'http://localhost:3000',
      options = {  
        transports: ['websocket'],
  			'force new connection': true
			}

let token = ""
let tokenStandard = ""

describe('Super-Hero-Catalog-API tests', function() {

	describe('#Authentication Tests', function() { 
		describe('#GET / superpowers without token', function() { 
			it('should return error Forbidden', function(done) { 
				request(app)
					.get('/superpowers')				
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(403) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Forbidden')
						done()
					})
			})
		})

		describe('#GET / superpowers invalid token', function() { 
			it('should return error Forbidden', function(done) { 
				request(app)
					.get('/superpowers')
					.set('x-access-token', '1234567890')
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Error: Not enough or too many segments')
						done()
					})
			})
		})

		describe('#GET / superpowers altered token', function() { 
			it('should return error Forbidden', function(done) { 
				request(app)
					.get('/superpowers')
					.set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InVzZXIgMDEiLCJyb2xlIjoiQWRtaW4iLCJleHBpcmVzIjoxNTMzMzA1MzgxNDUwfQ.BeZ9krNdkzjB3DqOXku4xPGqg38wMx6BVV3ptKxcCIk')
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Error: Signature verification failed')
						done()
					})
			})
		})
	
		describe('#User empty ', function() { 
			it('should return error message', function(done) { 
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

		describe('#User not exists ', function() { 
			it('should return error message', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'watson', password: 'mistersherlock'})
					.end(function(err, res) {
						expect(res.statusCode).to.equal(404)
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('Not Found in database')
						done()
					})
			})
		})

		describe('#Wrong password ', function() { 
			it('should return error message', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'alfred', password: 'mistersherlock'})
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
		
		describe('#GET / superpowers', function() { 
			it('should return the first page of superpowers list', function(done) { 
				request(app)
					.get('/superpowers')
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

	let user = {username:'test', password:'test', role:'Standard'}
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

	let superpower01 = {name:'super power 01', description:'description super power'}
	describe('#Super Powers Tests', function() { 
		describe('#POST / superpowers / empty', function() { 
			it('should return error validation messages', function(done) { 
				request(app)
					.post('/superpowers')
					.set('x-access-token', token)
					.send({name:'', description:''})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.be.an('array')
						done()
					})
			})
		})

		describe('#POST / superpowers', function() { 
			it('should return new superpower data', function(done) { 
				request(app)
					.post('/superpowers')
					.set('x-access-token', token)
					.send(superpower01)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Create successful')
						superpower01 = res.body.data.superpowers
						done()
					})
			})
		})
	
		superpower01.name = 'super power 01 plus'
		describe('#PUT / superpowers', function() { 
			it('should return success', function(done) { 
				request(app)
					.put('/superpowers/' + superpower01._id)
					.set('x-access-token', token)
					.send(superpower01)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Update successful')
						done()
					})
			})
		})

		describe('#GET / superpowers / id', function() { 
			it('should return the superpowers created', function(done) { 
				request(app)
					.get('/superpowers/' + superpower01._id)
					.set('x-access-token', token)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Read successful')
						expect(res.body.data.superpowers._id).to.equal(superpower01._id)
						done()
					})
			})
		})		
				
		describe('#GET / superpowers', function() { 
			it('should return the first page of superpowers list', function(done) { 
				request(app)
					.get('/superpowers')
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

	describe('#Super Heroes Tests', function() {		
		let superhero = {
			name:'super hero 01', 
			alias:'alias 01',
			protectionArea : {
				name: 'São Paulo',
				lat: '-23.5489',
				long: '-46.6388',
				radius: '30'
			},
			superpower:[superpower01._id]
		}

		describe('#POST / superheroes / no super power', function() { 
			it('should return error super power required', function(done) { 
				request(app)
					.post('/superheroes')
					.set('x-access-token', token)
					.send({name:'', alias:'', protectionArea:{}, superpower:[]})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('The Super Hero must have at least one super power')
						done()
					})
			})
		})

		describe('#POST / superheroes / empty', function() { 
			it('should return error validation messages', function(done) { 
				request(app)
					.post('/superheroes')
					.set('x-access-token', token)
					.send({name:'', alias:'', protectionArea:{}, superpower:[superpower01._id]})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.be.an('array')
						done()
					})
			})
		})

		describe('#POST / superheroes', function() { 
			it('should return new superhero data', function(done) { 
				request(app)
					.post('/superheroes')
					.set('x-access-token', token)
					.send(superhero)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Create successful')
						superhero = res.body.data.superheroes
						done()
					})
			})
		})
	
		superhero.name = 'super hero 01'
		describe('#PUT / superheroes', function() { 
			it('should return success', function(done) { 
				request(app)
					.put('/superheroes/' + superhero._id)
					.set('x-access-token', token)
					.send(superhero)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Update successful')
						done()
					})
			})
		})

		describe('#GET / superheroes / id', function() { 
			it('should return the superheroes created', function(done) { 
				request(app)
					.get('/superheroes/' + superhero._id)
					.set('x-access-token', token)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Read successful')
						expect(res.body.data.superheroes._id).to.equal(superhero._id)
						done()
					})
			})
		})

		describe('#DELETE / superheroes', function() { 
			it('should return success', function(done) { 
				request(app)
					.delete('/superheroes/' + superhero._id)
					.set('x-access-token', token)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Delete successful')
						done()
					})
			})
		})

		describe('#GET / superheroes', function() { 
			it('should return the first page of superheroes list', function(done) { 
				request(app)
					.get('/superheroes')
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


		describe('#DELETE / superpowers', function() { 
			it('should return success', function(done) { 
				request(app)
					.delete('/superpowers/' + superpower01._id)
					.set('x-access-token', token)
					.end(function(err, res) {
						expect(res.statusCode).to.equal(200)
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Delete successful')
						done()
					})
			})
		})
	})

	describe('#Push Notifications Tests - Socket-io', function() {
		describe('#Authentication denied', function () {  
			var client1
			it('should connect and receive error message', function (done) {  
				client1 = io.connect(socketUrl, options)
				client1.on('welcome', function(msg){
					expect(msg).to.equal('Authorizathion token not sent or invalid.')
					done()
				})
				client1.on('connect', function(){
					client1.emit('subscribe', "test")
				})
			})  
		})
		
		describe('#Authentication token low privilege', function () {  
			var client2
			it('should connect and receive error message', function (done) {  
				client2 = io.connect(socketUrl, options)
				client2.on('welcome', function(msg){
					expect(msg).to.equal('Unauthorized (low privilege)')
					done()
				})
		
				client2.on('connect', function(){
					client2.emit('subscribe', tokenStandard)
				})
			})  
		})

		describe('#Authentication correct', function () {  
			var client2
			it('should connect and receive welcome message', function (done) {  
				client2 = io.connect(socketUrl, options)
				client2.on('welcome', function(msg){
					expect(msg).to.equal('Welcome to Super Hero Catalogue Server Notification Socket - all messages will be sent in the audit event.')
					done()
				})
		
				client2.on('connect', function(){
					client2.emit('subscribe', token)
				})
			})  
		})
	})
})
