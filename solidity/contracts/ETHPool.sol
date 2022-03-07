// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol
/**
 * @dev Wrappers over Solidity's arithmetic operations.
 *
 * NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 * now has built in overflow checking.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the substraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}

/*
  ASSUMPTIONS:
  ============
  - Unlimited gas budget
  - Very basic security patterns implement
  - ETHPool team has just one account (owner)
  - ETHPool team account is the contract account creator (owner). For simplicity I don't implement @openzeppelin/contracts/access/AccessControl.sol (best option for this situation)
  - Rewards for each account are calculated in the moment when the team account deposits
*/
contract ETHPool {

  using SafeMath for uint256;

  address public owner = msg.sender;

  modifier onlyBy(address _account) {
    require(msg.sender == _account, "Sender not authorized.");
    _;
  }


  uint256 depositsTotal = 0;

  // helper variable to know accounts in the pool as mappings are not iterables
  address[] private accountsInThePool;

  // We map user addresses to Deposit, this way, each address has a Deposit assigned to them.
  // mapping (address => uint256) private deposits;
  mapping (address => Deposit) private deposits;

  // The struct of the Deposit.
  struct Deposit {
    bool created;
    uint256 amount;
  }


  // Emits an event when a new deposit is added, you can use this to update remote deposit lists.
  event depositAdded(address user, uint256 amount, uint256 total);
  // Emits an event when a new reward is added, you can use this to update remote reward lists.
  event rewardAdded(address user, uint256 amount, uint256 total);
  // Emits an event for account withdrawal
  event withdrawal(uint256 amount);

  // DEBUGGING
  // event percentageLog(uint256 amount);
  // event depositTotalLog(uint256 amount);
  // event totalLog(uint256 amount);


  function changeOwner(address _newOwner) public onlyBy(owner) {
    owner = _newOwner;
  }


  // Gets the deposits for the used who called the function
  // function getDeposits() public view returns (Deposit [] memory) {
  //   return deposits[msg.sender];
  // }


  // function getRewards() public view returns (Deposit [] memory) {
  //   return deposits[owner];
  // }


  function getDepositsTotal() public view returns (uint256) {
    return depositsTotal;
  }


  // Adds a deposit to the user's Deposit list who called the function.
  function addDeposit() public payable {

    // require a not null address.
    require(address(msg.sender) != address(0), "Invalid address");
    require(owner != msg.sender, "ETHPool Team cannot deposit");

    // require a valid amount.
    require(msg.value > 0, "Amount value is not valid!");


    if (!deposits[msg.sender].created) {
      accountsInThePool.push(msg.sender);
      deposits[msg.sender].created = true;
      deposits[msg.sender].amount = 0;
    }
    deposits[msg.sender].amount = deposits[msg.sender].amount.add(msg.value);

    depositsTotal = depositsTotal.add(msg.value);

    // emits item added event.
    emit depositAdded(msg.sender, msg.value, deposits[msg.sender].amount);
  }


  function addReward() public onlyBy(owner) payable {

    // require a not null address.
    require(address(msg.sender) != address(0), "Invalid address");

    // require a valid amount.
    require(msg.value > 0, "Amount value is not valid!");

    bool canAddReward = false;
    uint256 accountLength = accountsInThePool.length;
    if (accountLength > 0) {
      for (uint256 i = 0; i < accountLength; i++) {
        address account = accountsInThePool[i];

        uint256 total = deposits[account].amount;
        if (total > 0) {
          canAddReward = true;
          uint256 percentage = total.mul(100).div(depositsTotal);
          // emit totalLog(total);
          // emit depositTotalLog(depositsTotal);
          // emit percentageLog(percentage);
          uint256 rewards = msg.value.mul(percentage).div(100);
          // uint rewards = ((deposits[account].amount * msg.value) / depositsTotal);
          deposits[account].amount = deposits[account].amount.add(rewards);
          emit rewardAdded(account, rewards, deposits[account].amount);
        }
      }
    }

    require(canAddReward, "Cannot add rewards. Will lost fund. Nobody will be able to withdraw it");
    depositsTotal = depositsTotal.add(msg.value);
  }

  function withdraw() external {
    require(address(msg.sender) != address(0), "Invalid address");
    require(owner != msg.sender, "ETHPool Team cannot withdraw");

    require(deposits[msg.sender].amount > 0, "Nothing to withdraw");
    require(getContractBalance() >= deposits[msg.sender].amount, "Not enougth founds!"); // very big problem!

    uint256 totalToWithdraw = deposits[msg.sender].amount;
    deposits[msg.sender].amount = 0;
    (bool success, ) = msg.sender.call{value:totalToWithdraw}("");

    require(success, "Withdraw failed");
    removeAddressFromThePool(msg.sender); // mantain as small a prossible the accountsInThePool array
    emit withdrawal(totalToWithdraw);
  }


  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getBalance() public view returns (uint256) {
    return deposits[msg.sender].amount;
  }

  function removeAddressFromThePool(address account) private {
    uint256 index;
    uint256 accountsInThePoolLength = accountsInThePool.length;

    for (uint256 i = 0; i < accountsInThePoolLength; i++) {
      if (account == accountsInThePool[i]) {
        index = i;
        break;
      }
    }
    require(index < accountsInThePoolLength, "index out of bound");

    for (uint256 i = index; i < accountsInThePoolLength - 1; i++) {
      accountsInThePool[i] = accountsInThePool[i + 1];
    }
    accountsInThePool.pop();
  }
}
