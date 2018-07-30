'use stricts'

const app = require('../app'),
			chai = require('chai'),
			request = require('supertest')
			expect = chai.expect
let token = ""

describe('Super-Hero-Catalog-API tests', function() {

	describe('#Authentication Tests', function() { 
		describe('#GET / superpowers', function() { 
			it('should return error Forbidden', function(done) { 
				request(app)
					.get('/superpowers')				
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(403); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.false;
						expect(res.body.message).to.equal('Forbidden')
						done()
					})
			})
		})
	
		describe('#User empty ', function() { 
			it('should return error message', function(done) { 
				request(app)
					.post('/users/authenticate')
					.send({username:'', password: ''}) .end(function(err, res) {
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
					.send({username:'watson', password: 'mistersherlock'}) .end(function(err, res) {
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
					.send({username:'alfred', password: 'mistersherlock'}) .end(function(err, res) {
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
					.send({username:'alfred', password: 'misterbruce'}) .end(function(err, res) {
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('List Successful')
						expect(res.body.data.list).to.be.an('array')
						done()
					})
			})
		})
	})

	let user = {username:'test', password:'test', role:'Admin'}

	describe('#Users Tests', function() { 
		describe('#POST / users', function() { 
			it('should return new user data', function(done) { 
				request(app)
					.post('/users')
					.set('x-access-token', token)
					.send(user)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('Create successful')
						user = res.body.data.users
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('List Successful')
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.false;
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('Read Successful')
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('List Successful')
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
		console.log('super hero', superhero)

		describe('#POST / superheroes / no super power', function() { 
			it('should return error super power required', function(done) { 
				request(app)
					.post('/superheroes')
					.set('x-access-token', token)
					.send({name:'', alias:'', protectionArea:{}, superpower:[]})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.false;
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
					.send({name:'', alias:'', protectionArea:{}, superpower:[superpower._id]})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.false;
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('Read Successful')
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
						expect(res.statusCode).to.equal(200); 
						expect(res.body).to.be.an('object'); 
						expect(res.body.success).to.be.true;
						expect(res.body.message).to.equal('List Successful')
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






	
})
