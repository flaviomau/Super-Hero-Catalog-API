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

let token = "",
	tokenStandard = ""

describe('Super-Hero-Catalog-API tests (Socket-io)', function() {

	describe('#Authentication Tests', function() { 		
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
