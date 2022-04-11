const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should()

contract('Token', (accounts) => {
    const name = 'my name'
    const symbol = 'Symbol'
    const decimals = 10
    const totalSupply = 10
    let token 

    beforeEach(async () => {
        token = await Token.new()
    })
    
    describe('deployment', () => {
        it('tracks the name', async () => {
            const token = await Token.new()
            const result = await token.name()
            result.should.equal(name)
        })

        it('tracks the symbol', async () => {
            const result = await token.symbol()
            result.should.equal(symbol)  
        })

        
        it('tracks the decimals', async () => {
            const result = await token.decimals()
            result.should.equal(decimals)
        })
  
    })
})