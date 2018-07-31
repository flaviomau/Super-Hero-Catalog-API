'use stricts'

const app = require('../app'),
			chai = require('chai'),
			request = require('supertest')
			expect = chai.expect

let token = ""
let superpower = {name:'superpower 01', description:'description superpower'}

describe('Super-Hero-Catalog-API tests (Super Powers)', function() {    
    
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

	describe('#SuperPowers Tests', function() { 
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
	
		superpower.name = 'superpower 01 plus'
		describe('#PUT / superpowers', function() { 
			it('should return success', function(done) { 
				request(app)
					.put('/superpowers/' + superpower._id)
					.set('x-access-token', token)
					.send(superpower)
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
					.get('/superpowers/' + superpower._id)
					.set('x-access-token', token)
					.end(function(err, res) { 
						expect(res.statusCode).to.equal(200) 
						expect(res.body).to.be.an('object') 
						expect(res.body.success).to.be.true
						expect(res.body.message).to.equal('Read successful')
						expect(res.body.data.superpowers._id).to.equal(superpower._id)
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
