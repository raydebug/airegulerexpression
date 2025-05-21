Feature: RegEx Library
  As a user
  I want to manage my saved regex patterns
  So that I can reuse and organize my patterns effectively

  Background:
    Given I have saved a pattern with:
      | description      | Match email addresses                                     |
      | pattern          | /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g       |
      | name             | Email Pattern                                             |
      | tags             | email, validation                                         |
    And I am on the library page

  Scenario: Viewing the library title
    Then I should see the title "Your RegEx Library"

  Scenario: Viewing saved patterns
    Then I should see a pattern named "Email Pattern"
    And I should see the description "Match email addresses"
    And I should see the tag "email"

  Scenario: Viewing pattern tags
    Then I should see the tag "email"
    And I should see the tag "validation"

  Scenario: Filtering patterns by search term
    Given I have also saved a pattern with:
      | description      | Match phone numbers                             |
      | pattern          | /[0-9]{3}-[0-9]{3}-[0-9]{4}/g                   |
      | name             | Phone Pattern                                   |
      | tags             | phone, validation                               |
    When I search for "email"
    Then I should see a pattern named "Email Pattern"
    And I should not see a pattern named "Phone Pattern"
    When I clear the search
    And I search for "phone"
    Then I should see a pattern named "Phone Pattern"
    And I should not see a pattern named "Email Pattern"

  Scenario: Editing a pattern
    When I click the "Edit" button for "Email Pattern"
    And I change the name to "Updated Email Pattern"
    And I change the description to "Updated description"
    And I click the "Save Changes" button
    Then I should see a pattern named "Updated Email Pattern"
    And I should see the description "Updated description"

  Scenario: Deleting a pattern
    When I click the "Delete" button for "Email Pattern"
    And I confirm the deletion
    Then I should not see a pattern named "Email Pattern"
    And I should see the message "Your library is empty" 