const app = require('../app'),
			chai = require('chai'),
			request = require('supertest')
			expect = chai.expect

let token = ""
let superhero = {
	name:'super hero 01', 
	alias:'alias 01',
	protectionArea : {
		name: 'Hortolândia',
		lat: '-22.8533',
		long: '-47.2147',
		radius: '30'
	},
	superpower:[]
}
let superpower = {name: "Super power test", description: "Super power test"}

describe('Super-Hero-Catalog-API tests (SuperHeroes)', function() {

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

	describe('#Super Heroes Tests', function() {	
		describe('#POST / superpowers', function() { 
			it('should return new superpower data', function(done) { 
				request(app)
					.post('/superpowers')
					.set('x-access-token', token)
					.send(superpower)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Create successful')
						superpower = res.body.data.superpowers
						done()
					})
			})
		})		

		describe('#POST / superheroes / no superpower', function() { 
			it('should return error superpower required', function(done) { 
				request(app)
					.post('/superheroes')
					.set('x-access-token', token)
					.send({name:'', alias:'', protectionArea:{}, superpower:[]})
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(401) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.equal('The Super Hero must have at least one superpower')
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
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.false
						expect(res.body.message).to.be.an('array')
						done()
					})
			})
		})

		superhero.superpower.push(superpower._id)
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
					.delete('/superpowers/' + superpower._id)
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
