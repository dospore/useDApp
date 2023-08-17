import { Config, ERC20Interface, useEthers } from '..'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { renderDAppHook } from './renderDAppHook'
import { connectContractToSigner } from '../hooks/useContractFunction'
import { setupTestingConfig, TestingNetwork } from './utils'

describe('connectContractToSigner', () => {
  let token: Contract
  let config: Config
  let network1: TestingNetwork

  beforeEach(async () => {
    ;({ config, network1 } = await setupTestingConfig())
    token = new Contract(network1.deployer.address, ERC20Interface)
  })

  it('throws error without signer', () => {
    expect(() => connectContractToSigner(token)).to.throw('No signer available in contract, options or library')
  })

  it('noop if contract has signer', async () => {
    const signer = await network1.provider.getSigner()
    const connectedContract = token.connect(signer) as Contract

    expect(connectContractToSigner(connectedContract).runner).to.eq(signer)
  })

  it('takes signer from options', async () => {
    const signer = await network1.provider.getSigner()
    const connectedContract = connectContractToSigner(token, { signer })

    expect(connectedContract.runner).to.eq(signer)
  })

  it('takes signer from library', async () => {
    const { result, waitForCurrent } = await renderDAppHook(() => useEthers(), { config })
    await waitForCurrent((val) => val?.library !== undefined)
    const { library } = result.current

    const signer = library && 'getSigner' in library ? await library.getSigner() : undefined

    const connectedContract = connectContractToSigner(token, undefined, signer)

    expect(connectedContract.runner).to.be.deep.eq(signer)
  })
})
